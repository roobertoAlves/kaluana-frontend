import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Reminder, ReminderFrequency, ReminderInsistence } from '../../types/domain'
import { Sheet } from '../../components/ui/pickers/Sheet'
import { TimeField } from '../../components/ui/pickers/fields'
import { ChipGroup } from '../../components/ui/forms'
import { REMINDER_SUGGESTIONS, fireLabel, nextFireTime } from '../../features/reminders/reminderModel'
import { formatTime } from '../../features/time/timeValues'
import { newId } from '../../services/storage'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

const LEADS = [0, 5, 10, 30, 60].map((m) => ({ value: m, label: m === 0 ? 'Na hora' : `${m} min` }))
const FREQS: { value: ReminderFrequency; label: string }[] = [
  { value: 'ONCE', label: 'Uma vez' },
  { value: 'DAILY', label: 'Todo dia' },
  { value: 'WEEKLY', label: 'Toda semana' },
]
const INSIST: { value: ReminderInsistence; label: string; hint: string }[] = [
  { value: 'LOW', label: 'Suave', hint: 'Avisa 1 vez.' },
  { value: 'MEDIUM', label: 'Média', hint: 'Repete 2 vezes se você não reagir.' },
  { value: 'HIGH', label: 'Alta', hint: 'Repete 4 vezes se você não reagir.' },
]

function nextHour(): string {
  return formatTime((new Date().getHours() + 1) % 24, 0)
}

interface Props {
  reminder?: Reminder | null
  presetTitle?: string
  onCancel: () => void
  onSave: (reminder: Reminder) => void
}

export function ReminderFormSheet({ reminder, presetTitle, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(reminder?.title ?? presetTitle ?? '')
  const [time, setTime] = useState(reminder?.time ?? nextHour())
  const [lead, setLead] = useState(reminder?.leadMinutes ?? 0)
  const [freq, setFreq] = useState<ReminderFrequency>(reminder?.frequency ?? 'DAILY')
  const [insist, setInsist] = useState<ReminderInsistence>(reminder?.insistence ?? 'MEDIUM')
  const [error, setError] = useState<string | null>(null)

  function save() {
    if (!title.trim()) {
      setError('Dê um nome ao lembrete.')
      return
    }
    onSave({
      id: reminder?.id ?? newId(),
      title: title.trim().slice(0, 60),
      time,
      leadMinutes: lead,
      frequency: freq,
      insistence: insist,
      enabled: reminder?.enabled ?? true,
    })
  }

  function pickTitle(t: string) {
    setTitle(t)
    setError(null)
  }

  return (
    <Sheet visible title={reminder ? 'Editar lembrete' : 'Novo lembrete'} confirmLabel={reminder ? 'Salvar' : 'Criar lembrete'} onCancel={onCancel} onConfirm={save} scroll>
      <Text style={styles.label}>O QUE LEMBRAR?</Text>
      <TextInput
        value={title}
        onChangeText={pickTitle}
        placeholder="Ex.: tomar remédio"
        placeholderTextColor={colors.sand}
        accessibilityLabel="Nome do lembrete"
        maxLength={60}
        style={[styles.input, error && styles.inputError]}
      />
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      {!reminder && (
        <View style={styles.suggestions}>
          {REMINDER_SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => pickTitle(s)}
              accessibilityRole="button"
              accessibilityState={{ selected: title === s }}
              style={[styles.suggestion, title === s && styles.suggestionOn]}
            >
              <Text style={[styles.suggestionText, title === s && styles.suggestionTextOn]}>{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.space} />
      <TimeField label="HORÁRIO" value={time} onChange={setTime} />
      <ChipGroup label="AVISAR COM ANTECEDÊNCIA DE" options={LEADS} value={lead} onChange={setLead} />
      <ChipGroup label="FREQUÊNCIA" options={FREQS} value={freq} onChange={setFreq} />
      <ChipGroup label="INSISTÊNCIA" options={INSIST} value={insist} onChange={setInsist} />
      <Text style={styles.muted}>{INSIST.find((i) => i.value === insist)?.hint}</Text>

      <View style={styles.preview} accessibilityLiveRegion="polite">
        <Text style={styles.previewLabel}>PRÓXIMO AVISO</Text>
        <Text style={styles.previewText}>{fireLabel(nextFireTime(time, lead))}</Text>
      </View>
    </Sheet>
  )
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink, marginBottom: spacing[2] },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.md, paddingHorizontal: spacing[4], fontFamily: fonts.body, fontSize: 17, color: colors.ink, backgroundColor: colors.bgSurface },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: spacing[1] },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: spacing[3] },
  suggestion: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing[3], borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.sand },
  suggestionOn: { borderStyle: 'solid', borderColor: colors.ink, backgroundColor: colors.cream },
  suggestionText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  suggestionTextOn: { fontFamily: fonts.bodyBold },
  space: { height: spacing[4] },
  muted: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: -spacing[2], marginBottom: spacing[4] },
  preview: { borderRadius: radius.lg, backgroundColor: colors.cream, padding: spacing[3], gap: 2, marginBottom: spacing[2] },
  previewLabel: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.textSecondary },
  previewText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink },
})
