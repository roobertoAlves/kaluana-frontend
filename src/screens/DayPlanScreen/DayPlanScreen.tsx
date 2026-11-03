import { useState } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { CheckIn, DayPlanBlock } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { SmallButton, formStyles } from '../../components/ui/forms'
import { DateField, TimeField } from '../../components/ui/pickers/fields'
import { FadeIn } from '../../components/motion/FadeIn'
import { PressableScale } from '../../components/motion/PressableScale'
import { Icon } from '../../components/ui/Icons'
import { useCollection } from '../../hooks/useCollection'
import { useTasks } from '../../hooks/useTasks'
import { useAssistantStatus } from '../../hooks/useAssistantStatus'
import { useDayPlan } from '../../hooks/useDayPlan'
import { checkInsSource } from '../../services/checkInsApi'
import { todayKey } from '../../services/storage'
import { focusSteps } from '../../features/tasks/taskModel'
import { nextSlot } from '../../features/plan/dayPlanner'
import { dayLabel } from '../../features/time/timeValues'
import { LEVEL_LABEL } from '../../features/reports/buildReport'
import { colors, fonts, radius, spacing } from '../../styles/tokens'
import { ReplanNotice } from './ReplanNotice'

type Props = NativeStackScreenProps<RootStackParamList, 'DayPlan'>

const DEFAULT_START = '08:00'
const DEFAULT_END = '22:00'

const ENERGY_HINT: Record<number, string> = {
  1: 'Dia difícil: o plano começa pelas tarefas mais curtas.',
  2: 'Dia difícil: o plano começa pelas tarefas mais curtas.',
  3: 'O plano segue prioridade e duração.',
  4: 'Dia tranquilo: as tarefas importantes e longas vêm antes.',
  5: 'Dia tranquilo: as tarefas importantes e longas vêm antes.',
}

/**
 * RF10/RF11/RF14: "o que faço agora e depois?" Linha do tempo de um dia (hoje
 * ou outro), com início e fim escolhidos no relógio. O plano de hoje se
 * reorganiza sozinho quando o dia muda.
 */
export function DayPlanScreen({ navigation }: Props) {
  const tasks = useTasks()
  const { items: checkins } = useCollection<CheckIn>(checkInsSource)
  const assistant = useAssistantStatus()
  const today = todayKey()
  const [date, setDate] = useState(today)
  const isToday = date === today
  // Hoje começa no próximo horário cheio de 5 min; outros dias, às 08:00.
  const [start, setStart] = useState(() => (nextSlot() > DEFAULT_START ? nextSlot() : DEFAULT_START))
  const [end, setEnd] = useState(DEFAULT_END)
  const [useAssistant, setUseAssistant] = useState(false)
  const energy = checkins.find((c) => c.date === date)?.level ?? null
  const day = useDayPlan(tasks, energy, date)
  const { plan } = day

  function focus(block: DayPlanBlock) {
    const task = tasks.items.find((t) => t.id === block.taskId)
    const minutes = minutesBetween(block.start, block.end)
    navigation.navigate('TimerPlan', {
      preset: { task: block.title.slice(0, 60), minutes, steps: task ? focusSteps(task) : [], taskId: block.taskId ?? undefined },
    })
  }

  const now = isToday ? day.now : '00:00'
  const earliest = isToday ? nextSlot() : '00:00'
  // Hoje não dá para começar no passado: o início acompanha o relógio.
  const effectiveStart = start < earliest ? earliest : start

  function changeDate(d: string) {
    setDate(d)
    setStart(d === today ? (nextSlot() > DEFAULT_START ? nextSlot() : DEFAULT_START) : DEFAULT_START)
  }
  const pendingCount = tasks.items.filter((t) => !t.done).length

  return (
    <Screen label="KALUANA · PLANO DO DIA" title="Plano do dia" onBack={() => navigation.goBack()} error={day.error}>
      <View style={styles.energy}>
        <Text style={styles.energyTitle}>{energy ? LEVEL_LABEL[energy] : isToday ? 'Sem check-in hoje' : `Plano para ${dayLabel(date)}`}</Text>
        <Text style={formStyles.muted}>{energy ? ENERGY_HINT[energy] : isToday ? 'Com o check-in, o plano se ajusta ao seu dia.' : 'Sem check-in para esse dia: o plano segue prioridade e duração.'}</Text>
        {!energy && isToday && <SmallButton label="Fazer check-in agora" onPress={() => navigation.navigate('CheckIn')} />}
      </View>

      <DateField label="DIA DO PLANO" value={date} onChange={changeDate} minimumDate={new Date()} />
      <View style={styles.times}>
        <View style={{ flex: 1 }}>
          <TimeField label="COMEÇAR ÀS" value={effectiveStart} onChange={setStart} />
        </View>
        <View style={{ flex: 1 }}>
          <TimeField label="TERMINAR ÀS" value={end} onChange={setEnd} />
        </View>
      </View>
      {isToday && start < earliest && <Text style={styles.source}>Já passou de {start}: o plano começa às {earliest}.</Text>}
      {!isToday && <Text style={styles.source}>Planejando {dayLabel(date)}. As tarefas com data até esse dia entram no plano.</Text>}

      {assistant.enabled && (
        <View style={[formStyles.row, styles.assistantRow]}>
          <View style={{ flex: 1 }}>
            <Text style={formStyles.itemTitle}>Pedir a ordem ao assistente</Text>
            <Text style={formStyles.muted}>Envia só o título e a duração das tarefas. Você revisa antes de seguir.</Text>
          </View>
          <Switch value={useAssistant} onValueChange={setUseAssistant} accessibilityLabel="Pedir a ordem ao assistente" trackColor={{ true: colors.emberBright }} />
        </View>
      )}

      <ArrowButton label={day.busy && !plan ? 'Montando...' : plan ? 'Montar de novo' : 'Montar meu plano'} onPress={() => day.build(effectiveStart, end, useAssistant && assistant.enabled)} />

      {plan && (
        <View style={{ marginTop: spacing[5] }}>
          <ReplanNotice changes={day.changes} stale={day.stale} busy={day.busy} onDismiss={day.dismissChanges} onReplan={day.replan} />
          {plan.source === 'ASSISTANT' && <Text style={styles.source}>Ordem sugerida pelo assistente{assistant.model ? ` (${assistant.model})` : ''}.</Text>}
          {plan.note && <Text style={styles.source}>{plan.note}</Text>}

          {plan.blocks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={formStyles.muted}>
                {pendingCount === 0 ? 'Nenhuma tarefa pendente para hoje.' : 'Nada coube nesse horário. Tente até mais tarde.'}
              </Text>
              <SmallButton label="Abrir tarefas" onPress={() => navigation.navigate('Tasks')} />
            </View>
          ) : (
            plan.blocks.map((b, i) => <BlockRow key={`${b.start}-${i}`} block={b} index={i} current={b.start <= now && now < b.end} onFocus={() => focus(b)} />)
          )}

          {plan.unscheduled.length > 0 && (
            <>
              <Text style={formStyles.sectionTitle}>NÃO COUBE HOJE ({plan.unscheduled.length})</Text>
              {plan.unscheduled.map((u) => (
                <Text key={u.taskId} style={styles.unscheduled}>
                  {u.title} · {u.minutes} min
                </Text>
              ))}
            </>
          )}

          <View style={[formStyles.row, styles.autoRow]}>
            <View style={{ flex: 1 }}>
              <Text style={formStyles.itemTitle}>Reorganizar sozinho</Text>
              <Text style={formStyles.muted}>Quando uma tarefa atrasa, termina antes ou chega uma nova, o plano se ajusta e mostra o que mudou.</Text>
            </View>
            <Switch value={day.autoReplan} onValueChange={day.setAutoReplan} accessibilityLabel="Reorganizar o plano sozinho" trackColor={{ true: colors.emberBright }} />
          </View>
        </View>
      )}
    </Screen>
  )
}

function BlockRow({ block, index, current, onFocus }: { block: DayPlanBlock; index: number; current: boolean; onFocus: () => void }) {
  const isBreak = block.kind === 'BREAK'
  return (
    <FadeIn index={index} style={styles.blockRow}>
      <View style={styles.timeCol}>
        <Text style={[styles.time, current && { color: colors.emberBright }]}>{block.start}</Text>
        <View style={[styles.rail, isBreak && styles.railBreak]} />
      </View>
      {isBreak ? (
        <View style={styles.breakCard} accessible accessibilityLabel={`Pausa de ${block.start} a ${block.end}`}>
          <Text style={styles.breakText}>Pausa · {minutesBetween(block.start, block.end)} min</Text>
        </View>
      ) : (
        <View style={[styles.taskCard, current && styles.taskCardNow]}>
          {current && <Text style={styles.nowLabel}>AGORA</Text>}
          <Text style={styles.taskTitle}>{block.title}</Text>
          <Text style={formStyles.muted}>
            {block.start}–{block.end} · {minutesBetween(block.start, block.end)} min
          </Text>
          <PressableScale onPress={onFocus} style={styles.focus} accessibilityRole="button" accessibilityLabel={`Focar em ${block.title}`}>
            <Icon name="timer" size={18} color={colors.ink} />
            <Text style={styles.focusText}>Focar</Text>
          </PressableScale>
        </View>
      )}
    </FadeIn>
  )
}

function minutesBetween(start: string, end: string): number {
  const m = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5))
  return m(end) - m(start)
}

const styles = StyleSheet.create({
  times: { flexDirection: 'row', gap: spacing[3] },
  energy: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[4], marginBottom: spacing[4] },
  energyTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginBottom: spacing[1] },
  assistantRow: { marginBottom: spacing[4] },
  autoRow: { marginTop: spacing[5] },
  source: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textSecondary, marginBottom: spacing[3] },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.sand, borderRadius: radius.lg, padding: spacing[4] },
  blockRow: { flexDirection: 'row', gap: spacing[3] },
  timeCol: { width: 52, alignItems: 'center' },
  time: { fontFamily: fonts.displayMedium, fontSize: 14, color: colors.ink },
  rail: { flex: 1, width: 3, backgroundColor: colors.ink, borderRadius: 2, marginTop: spacing[1], marginBottom: spacing[1] },
  railBreak: { backgroundColor: colors.sageBright },
  taskCard: { flex: 1, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[4], marginBottom: spacing[3] },
  taskCardNow: { borderColor: colors.emberBright, borderWidth: 2 },
  nowLabel: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.emberBright, marginBottom: spacing[1] },
  taskTitle: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink, marginBottom: 2 },
  focus: { flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: spacing[1], minHeight: 44, marginTop: spacing[2], paddingHorizontal: spacing[3], borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.md },
  focusText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  breakCard: { flex: 1, justifyContent: 'center', minHeight: 40, marginBottom: spacing[3] },
  breakText: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  unscheduled: { fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary, minHeight: 32 },
})
