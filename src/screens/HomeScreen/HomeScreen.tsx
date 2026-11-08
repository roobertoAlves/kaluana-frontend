import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import type { CheckIn, Reminder } from '../../types/domain'
import { BottomMenu } from '../../components/ui/BottomMenu'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Icon } from '../../components/ui/Icons'
import type { IconName } from '../../components/ui/Icons'
import { useAuth } from '../../context/AuthContext'
import { useTimer } from '../../context/TimerContext'
import { useCollection } from '../../hooks/useCollection'
import { useProfile } from '../../hooks/useProfile'
import { useLastDayReview } from '../../hooks/useLastDayReview'
import { shouldOfferReview } from '../../features/review/dayReview'
import { remindersSource } from '../../services/remindersApi'
import { checkInsSource } from '../../services/checkInsApi'
import { todayKey } from '../../services/storage'
import { nextFireTime } from '../../services/notifications'
import { LEVEL_LABEL } from '../../features/reports/buildReport'
import { formatClock, remainingMs } from '../../features/timer/timerSession'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

type Shortcut = { label: string; icon: IconName; go: (n: Props['navigation']) => void }

const SHORTCUTS: Shortcut[] = [
  { label: 'Tarefas', icon: 'list', go: (n) => n.navigate('Tasks') },
  { label: 'Plano do dia', icon: 'calendar', go: (n) => n.navigate('DayPlan') },
  { label: 'Check-in', icon: 'check', go: (n) => n.navigate('CheckIn') },
  { label: 'Temporizador', icon: 'timer', go: (n) => n.navigate('TimerPlan') },
  { label: 'Sons', icon: 'sound', go: (n) => n.navigate('Sounds') },
  { label: 'Lembretes', icon: 'bell', go: (n) => n.navigate('Reminders') },
  { label: 'Eventos', icon: 'note', go: (n) => n.navigate('EventLog') },
]

const SCENARIOS: { label: string; hint: string; go: (n: Props['navigation']) => void }[] = [
  { label: 'Sair de casa', hint: '10 min', go: (n) => n.navigate('TimerPlan', { preset: { task: 'Sair de casa', minutes: 10, steps: ['Chaves', 'Carteira', 'Celular'] } }) },
  { label: 'Foco 25 min', hint: 'Temporizador', go: (n) => n.navigate('TimerPlan', { preset: { task: 'Foco', minutes: 25 } }) },
  { label: 'Beber água', hint: 'Lembrete', go: (n) => n.navigate('Reminders', { preset: 'Beber água' }) },
  { label: 'Pausa', hint: '5 min', go: (n) => n.navigate('TimerPlan', { preset: { task: 'Pausa', minutes: 5 } }) },
]

function nextReminder(list: Reminder[]): { r: Reminder; at: Date } | null {
  const upcoming = list.filter((r) => r.enabled).map((r) => ({ r, at: nextFireTime(r.time, r.leadMinutes) }))
  upcoming.sort((a, b) => a.at.getTime() - b.at.getTime())
  return upcoming[0] ?? null
}

function untilLabel(at: Date): string {
  const min = Math.max(0, Math.round((at.getTime() - Date.now()) / 60_000))
  if (min < 60) return `em ${min} min`
  const h = Math.floor(min / 60)
  return `em ${h} h${min % 60 ? ` ${min % 60} min` : ''}`
}

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { value: profile } = useProfile()
  const { session, now } = useTimer()
  const { items: reminders } = useCollection<Reminder>(remindersSource)
  const { items: checkins } = useCollection<CheckIn>(checkInsSource)
  const review = useLastDayReview()
  const offerReview = review.loaded && shouldOfferReview(new Date(now), review.lastDay)

  const firstName = profile.nickname || profile.displayName.split(' ')[0] || user?.name?.split(' ')[0] || ''
  const next = nextReminder(reminders)
  const today = checkins.find((c) => c.date === todayKey())
  const activeSession = session && (session.status === 'RUNNING' || session.status === 'PAUSED' || session.status === 'DONE') ? session : null

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={[styles.scroll, { paddingTop: spacing[5] + insets.top }]}>
        <View style={styles.content}>
          <Text style={styles.label}>KALUANA · INÍCIO</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {'olá,\n'}{firstName}.
          </Text>

          {user?.role === 'RESPONSIBLE' ? (
            <>
              <Text style={styles.muted}>
                Sua conta está vinculada como responsável. Você verá aqui apenas o que o usuário principal autorizar.
              </Text>
              <View style={{ marginTop: spacing[5] }}>
                <ArrowButton label="Ver relatório" onPress={() => navigation.navigate('Report')} />
              </View>
            </>
          ) : (
            <>
              <Pressable
                onPress={() => navigation.navigate('Reminders')}
                accessibilityRole="button"
                style={[styles.card, styles.reminder]}
              >
                <View style={styles.reminderIcon}>
                  <Icon name={next?.r.title.toLowerCase().includes('água') ? 'drop' : 'bell'} color={colors.white} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardLabel}>PRÓXIMO LEMBRETE</Text>
                  <Text style={styles.cardTitle}>{next ? next.r.title : 'Nenhum lembrete ativo'}</Text>
                  <Text style={styles.muted}>{next ? `${next.r.time} · ${untilLabel(next.at)}` : 'Toque para criar um'}</Text>
                </View>
                <Icon name="chevron" size={20} color={colors.sand} />
              </Pressable>

              {activeSession && (
                <Pressable
                  onPress={() => navigation.navigate(activeSession.status === 'DONE' ? 'TimerDone' : 'Timer')}
                  accessibilityRole="button"
                  accessibilityLabel={`Sessão ${activeSession.task}. Abrir temporizador`}
                  style={styles.mini}
                >
                  <Icon name="timer" color={colors.white} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.miniTitle}>{activeSession.task}</Text>
                    <Text style={styles.miniSub}>
                      {activeSession.status === 'DONE' ? 'Sessão concluída' : activeSession.status === 'PAUSED' ? 'Pausada' : 'Em andamento'}
                    </Text>
                  </View>
                  {activeSession.status !== 'DONE' && <Text style={styles.miniTime}>{formatClock(remainingMs(activeSession, now))}</Text>}
                </Pressable>
              )}

              {offerReview && (
                <Pressable onPress={() => navigation.navigate('DayReview')} accessibilityRole="button" style={[styles.card, styles.review]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>FIM DO DIA</Text>
                    <Text style={styles.cardTitle}>Encerrar o dia</Text>
                    <Text style={styles.muted}>Revise o que ficou e prepare amanhã. Leva 1 minuto.</Text>
                  </View>
                  <Icon name="chevron" size={20} color={colors.sand} />
                </Pressable>
              )}

              <ScrollView bounces={false} overScrollMode="never" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
                {SHORTCUTS.map((s) => (
                  <Pressable key={s.label} onPress={() => s.go(navigation)} accessibilityRole="button" accessibilityLabel={s.label} style={styles.shortcut}>
                    <View style={styles.circle}>
                      <Icon name={s.icon} color={colors.ink} />
                    </View>
                    <Text style={styles.shortcutLabel}>{s.label}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.section}>CENÁRIOS RÁPIDOS</Text>
              <View style={styles.grid}>
                {SCENARIOS.map((s) => (
                  <Pressable
                    key={s.label}
                    onPress={() => s.go(navigation)}
                    accessibilityRole="button"
                    accessibilityLabel={`${s.label}. ${s.hint}`}
                    style={({ pressed }) => [styles.scenario, pressed && { backgroundColor: colors.cream }]}
                  >
                    <Text style={styles.scenarioTitle}>{s.label}</Text>
                    <Text style={styles.muted}>{s.hint}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.section}>CHECK-IN DE HOJE</Text>
              <Pressable onPress={() => navigation.navigate('CheckIn')} accessibilityRole="button" style={[styles.card, styles.row]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{today ? LEVEL_LABEL[today.level] : 'Ainda não registrado'}</Text>
                  <Text style={styles.muted}>{today ? 'Toque para atualizar.' : 'Leva menos de um minuto.'}</Text>
                </View>
                <Icon name="chevron" size={20} color={colors.sand} />
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
      <BottomMenu
        active="inicio"
        onNavigate={(tab) => {
          if (tab === 'perfil') navigation.navigate('Profile')
          if (tab === 'configuracoes') navigation.navigate('Settings')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  scroll: { padding: spacing[5], paddingBottom: spacing[6] },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.emberBright, marginBottom: spacing[2] },
  title: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, color: colors.ink, marginBottom: spacing[5] },
  muted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  card: { backgroundColor: colors.bgSurface, padding: spacing[4], borderRadius: radius.lg, borderLeftWidth: 3, borderLeftColor: colors.emberBright, marginBottom: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  reminder: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  review: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], borderLeftColor: colors.sageBright },
  reminderIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.emberBright, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontFamily: fonts.displayMedium, fontSize: 10, letterSpacing: 1.2, color: colors.emberBright, marginBottom: 2 },
  cardTitle: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, marginBottom: 2 },
  mini: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.ink, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  miniTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.white },
  miniSub: { fontFamily: fonts.body, fontSize: 12, color: colors.cream },
  miniTime: { fontFamily: fonts.display, fontSize: 22, color: colors.white },
  carousel: { gap: spacing[4], paddingVertical: spacing[2], paddingRight: spacing[5] },
  shortcut: { alignItems: 'center', width: 76, minHeight: 96 },
  circle: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.bgSurface, borderWidth: 1.5, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[2] },
  shortcutLabel: { fontFamily: fonts.bodyBold, fontSize: 12, color: colors.ink, textAlign: 'center' },
  section: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.ink, marginTop: spacing[5], marginBottom: spacing[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  scenario: { width: '48%', minHeight: 76, backgroundColor: colors.bgSurface, padding: spacing[4], borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream },
  scenarioTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink, marginBottom: 2 },
})
