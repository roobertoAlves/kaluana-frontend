import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { Task } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { ChipGroup, SmallButton, formStyles } from '../../components/ui/forms'
import { FadeIn } from '../../components/motion/FadeIn'
import { PressableScale } from '../../components/motion/PressableScale'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/useTasks'
import { useLastDayReview } from '../../hooks/useLastDayReview'
import { saveDayReview } from '../../services/dayReviewApi'
import { errorMessage } from '../../services/http'
import { todayKey } from '../../services/storage'
import { ACTIONS, FEELINGS, applyMove, completedOn, pendingFor, summaryLine } from '../../features/review/dayReview'
import type { DayFeeling, ReviewAction, ReviewMove } from '../../features/review/dayReview'
import { taskMeta } from '../../features/tasks/taskModel'
import { suggestSound } from '../../features/sounds/soundscape'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'DayReview'>

/** RF17 (Sunsama): encerrar o dia. O que ficou não some: a pessoa escolhe para onde vai. */
export function DayReviewScreen({ navigation }: Props) {
  const { accessToken } = useAuth()
  const tasks = useTasks()
  const review = useLastDayReview()
  const today = todayKey()
  const [choices, setChoices] = useState<Record<string, ReviewAction>>({})
  const [feeling, setFeeling] = useState<DayFeeling | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)

  const pending = pendingFor(tasks.items, today)
  const completed = completedOn(tasks.items, today)

  function choose(task: Task, action: ReviewAction) {
    // Tocar de novo na mesma opção desfaz a escolha.
    const next = { ...choices }
    if (next[task.id] === action) delete next[task.id]
    else next[task.id] = action
    setChoices(next)
  }

  async function finish() {
    const moves: ReviewMove[] = Object.entries(choices).map(([taskId, action]) => ({ taskId, action }))
    setSaving(true)
    setError(null)
    try {
      if (accessToken) {
        await saveDayReview(accessToken, today, { feeling, moves })
        await tasks.reload()
      } else {
        for (const m of moves) {
          const task = tasks.find(m.taskId)
          if (task) await tasks.upsert(applyMove(task, m.action, today))
        }
      }
      await review.markReviewed(today)
      setSummary(summaryLine(moves))
    } catch (e) {
      setError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  if (summary !== null) {
    const { sound } = suggestSound()
    return (
      <Screen label="KALUANA · FIM DO DIA" title="Dia encerrado" onBack={() => navigation.goBack()}>
        <FadeIn style={styles.card}>
          <Text style={styles.cardTitle}>Tudo certo por hoje</Text>
          <Text style={formStyles.muted}>{summary} O que foi para amanhã entra no plano do dia de amanhã.</Text>
        </FadeIn>
        <Text style={[formStyles.muted, styles.space]}>Descanse. Se quiser, os sons de Dormir ajudam a desligar.</Text>
        <SmallButton label="Sons para dormir (30 min)" onPress={() => navigation.navigate('Sleep', { sound, minutes: 30 })} />
        <View style={styles.space} />
        <ArrowButton label="Voltar ao início" onPress={() => navigation.navigate('Home')} />
      </Screen>
    )
  }

  return (
    <Screen label="KALUANA · FIM DO DIA" title="Encerrar o dia" onBack={() => navigation.goBack()} error={error ?? tasks.error}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {completed.length === 0 ? 'Hoje não teve tarefa marcada como feita' : `Hoje você concluiu ${completed.length} ${completed.length === 1 ? 'tarefa' : 'tarefas'}`}
        </Text>
        <Text style={formStyles.muted}>Tudo bem do jeito que foi. O que ficou não some: escolha para onde vai.</Text>
      </View>

      <Text style={formStyles.sectionTitle}>FICOU PARA DEPOIS ({pending.length})</Text>
      {pending.length === 0 && <Text style={formStyles.muted}>Nenhuma tarefa de hoje ficou pendente.</Text>}
      {pending.map((t, i) => (
        <FadeIn key={t.id} index={i} style={styles.row}>
          <Text style={styles.rowTitle}>{t.title}</Text>
          <Text style={formStyles.muted}>{taskMeta(t, today)}</Text>
          <View style={styles.actions} accessibilityRole="radiogroup" accessibilityLabel={`O que fazer com ${t.title}`}>
            {ACTIONS.map((a) => {
              const on = choices[t.id] === a.value
              return (
                <PressableScale
                  key={a.value}
                  onPress={() => choose(t, a.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  containerStyle={styles.pillBox}
                  style={[styles.pill, on && styles.pillOn]}
                >
                  <Text style={[styles.pillText, on && styles.pillTextOn]}>{a.label}</Text>
                </PressableScale>
              )
            })}
          </View>
        </FadeIn>
      ))}
      {pending.length > 0 && <Text style={[formStyles.muted, styles.small]}>Sem escolha, a tarefa fica como está.</Text>}

      <ChipGroup<DayFeeling | 'NONE'>
        label="COMO FOI O DIA? (OPCIONAL)"
        options={[...FEELINGS, { value: 'NONE', label: 'Prefiro não dizer' }]}
        value={feeling ?? 'NONE'}
        onChange={(v) => setFeeling(v === 'NONE' ? null : v)}
      />
      <ArrowButton label={saving ? 'Encerrando...' : 'Encerrar o dia'} loading={saving} onPress={finish} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[4], gap: spacing[1] },
  cardTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink },
  row: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[3], marginBottom: spacing[2], gap: 2 },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink },
  actions: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] },
  pillBox: { flex: 1 },
  pill: { minHeight: 44, borderRadius: 999, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: colors.ink },
  pillText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink },
  pillTextOn: { color: colors.white },
  small: { fontSize: 13 },
  space: { marginTop: spacing[4] },
})
