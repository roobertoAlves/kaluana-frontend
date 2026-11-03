import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { Reminder } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { formStyles } from '../../components/ui/forms'
import { Icon } from '../../components/ui/Icons'
import { Sheet } from '../../components/ui/pickers/Sheet'
import { useCollection } from '../../hooks/useCollection'
import { remindersSource } from '../../services/remindersApi'
import { cancelReminder, ensureNotificationSetup, rescheduleAll, scheduleReminder } from '../../services/notifications'
import { describeReminder, fireLabel, groupReminders } from '../../features/reminders/reminderModel'
import { ReminderFormSheet } from './ReminderFormSheet'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'>

type Form = { mode: 'new'; preset?: string } | { mode: 'edit'; reminder: Reminder }

/**
 * RF2: lembretes. O próximo aviso em destaque, a lista em ordem do que vem
 * primeiro (pausados à parte) e um formulário em folha com o relógio.
 */
export function RemindersScreen({ navigation, route }: Props) {
  const { items, upsert, remove, loading, error: apiError } = useCollection<Reminder>(remindersSource)
  // Atalho "Beber água" da Home: abre o formulário já com o nome.
  const [form, setForm] = useState<Form | null>(() => (route.params?.preset ? { mode: 'new', preset: route.params.preset } : null))
  const [deleting, setDeleting] = useState<Reminder | null>(null)

  useEffect(() => {
    if (route.params?.preset) navigation.setParams({ preset: undefined })
  }, [route.params?.preset, navigation])

  // Ao abrir, reagenda tudo (cobre reinício do aparelho e lembretes antigos).
  useEffect(() => {
    if (!loading) void rescheduleAll(items.filter((r) => r.enabled))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  const { active, paused } = groupReminders(items)
  const next = active[0]

  async function apply(r: Reminder) {
    // Agenda com o lembrete devolvido pela API: ao criar, o id passa a ser o do servidor.
    const saved = await upsert(r)
    if (!saved) return
    try {
      if (!saved.enabled) {
        await cancelReminder(saved)
        return
      }
      if (!(await ensureNotificationSetup())) {
        Alert.alert('Notificações desligadas', 'Ative as notificações do Kaluanã nas configurações do aparelho para receber lembretes.')
        return
      }
      await scheduleReminder(saved)
    } catch {
      Alert.alert('Não foi possível agendar', 'O lembrete foi salvo, mas o agendamento falhou. No Expo Go isso pode acontecer; use o build de desenvolvimento.')
    }
  }

  async function confirmDelete() {
    const r = deleting
    setDeleting(null)
    if (r && (await remove(r.id))) await cancelReminder(r).catch(() => {})
  }

  const row = (r: Reminder, at?: Date) => (
    <View key={r.id} style={[styles.card, !r.enabled && styles.cardPaused]}>
      <Pressable onPress={() => setForm({ mode: 'edit', reminder: r })} accessibilityRole="button" accessibilityHint="Toque para editar" style={styles.cardMain}>
        <Text style={[styles.time, !r.enabled && styles.mutedText]}>{r.time}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, !r.enabled && styles.mutedText]}>{r.title}</Text>
          <Text style={styles.meta}>{describeReminder(r)}</Text>
          {at && <Text style={styles.next}>Próximo aviso {fireLabel(at)}</Text>}
        </View>
      </Pressable>
      <View style={styles.cardSide}>
        <Switch
          value={r.enabled}
          onValueChange={(v) => void apply({ ...r, enabled: v })}
          accessibilityLabel={`${r.enabled ? 'Pausar' : 'Ativar'} ${r.title}`}
          trackColor={{ true: colors.emberBright }}
        />
        <Pressable onPress={() => setDeleting(r)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Apagar ${r.title}`}>
          <Icon name="close" size={20} color={colors.sand} />
        </Pressable>
      </View>
    </View>
  )

  return (
    <Screen label="KALUANA · LEMBRETES" title="Lembretes" onBack={() => navigation.goBack()} error={apiError}>
      {next && (
        <View style={styles.hero} accessibilityRole="summary">
          <Icon name="bell" size={22} color={colors.white} />
          <View style={{ flex: 1 }}>
            <Text style={styles.heroLabel}>PRÓXIMO AVISO</Text>
            <Text style={styles.heroText}>
              {next.reminder.title} · {fireLabel(next.at)}
            </Text>
          </View>
        </View>
      )}

      <ArrowButton label="Novo lembrete" onPress={() => setForm({ mode: 'new' })} />

      {!loading && items.length === 0 && (
        <View style={styles.empty}>
          <Text style={formStyles.itemTitle}>Nenhum lembrete ainda</Text>
          <Text style={formStyles.muted}>Crie um para remédio, água, pausas ou compromissos. O aviso chega mesmo com o app fechado.</Text>
        </View>
      )}

      {active.length > 0 && (
        <>
          <Text style={formStyles.sectionTitle}>ATIVOS ({active.length})</Text>
          {active.map(({ reminder, at }) => row(reminder, at))}
        </>
      )}
      {paused.length > 0 && (
        <>
          <Text style={formStyles.sectionTitle}>PAUSADOS ({paused.length})</Text>
          {paused.map((r) => row(r))}
        </>
      )}

      {form && (
        <ReminderFormSheet
          key={form.mode === 'edit' ? form.reminder.id : 'new'}
          reminder={form.mode === 'edit' ? form.reminder : null}
          presetTitle={form.mode === 'new' ? form.preset : undefined}
          onCancel={() => setForm(null)}
          onSave={(r) => {
            setForm(null)
            void apply(r)
          }}
        />
      )}

      <Sheet
        visible={!!deleting}
        title={`Apagar "${deleting?.title ?? ''}"?`}
        confirmLabel="Apagar"
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      >
        <Text style={styles.confirmText}>O aviso deixa de chegar neste aparelho. Isso não pode ser desfeito.</Text>
      </Sheet>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.ink, borderRadius: radius.lg, padding: spacing[4], marginBottom: spacing[4] },
  heroLabel: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.emberLight },
  heroText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.white, marginTop: 2 },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.sand, borderRadius: radius.lg, padding: spacing[4], gap: spacing[1], marginTop: spacing[5] },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[3], marginBottom: spacing[3] },
  cardPaused: { backgroundColor: colors.bgMuted },
  cardMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 56 },
  cardSide: { alignItems: 'center', gap: spacing[2] },
  time: { fontFamily: fonts.display, fontSize: 24, color: colors.ink, minWidth: 72 },
  title: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink },
  mutedText: { color: colors.textSecondary },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  next: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.ember, marginTop: 2 },
  confirmText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.ink, textAlign: 'center' },
})
