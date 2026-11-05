import { useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Icon } from '../Icons'
import type { IconName } from '../Icons'
import { Sheet } from './Sheet'
import { Wheel } from './Wheel'
import { clampMinutes, dateWithTime, dayLabel, durationLabel, formatDay, formatTime, parseDay, parseTime, timeOfDate, wheelRange } from '../../../features/time/timeValues'
import { colors, fonts, radius, spacing } from '../../../styles/tokens'

function FieldButton({ label, value, icon, onPress, hint }: { label: string; value: string; icon: IconName; onPress: () => void; hint?: string }) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} accessibilityHint={hint ?? 'Abre o seletor'} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <Icon name={icon} size={22} color={colors.ink} />
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.change}>Alterar</Text>
      </Pressable>
    </View>
  )
}

interface TimeFieldProps {
  label: string
  value: string
  onChange: (hhmm: string) => void
}

export function TimeField({ label, value, onChange }: TimeFieldProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(parseTime(value))

  function show() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateWithTime(value),
        mode: 'time',
        display: 'clock',
        is24Hour: true,
        onChange: (e: DateTimePickerEvent, d?: Date) => {
          if (e.type === 'set' && d) onChange(timeOfDate(d))
        },
      })
      return
    }
    setDraft(parseTime(value))
    setOpen(true)
  }

  return (
    <>
      <FieldButton label={label} value={value} icon="timer" onPress={show} />
      <Sheet visible={open} title={label} onCancel={() => setOpen(false)} onConfirm={() => { onChange(formatTime(draft.hour, draft.minute)); setOpen(false) }}>
        {Platform.OS === 'ios' ? (
          <DateTimePicker
            value={dateWithTime(formatTime(draft.hour, draft.minute))}
            mode="time"
            display="spinner"
            locale="pt-BR"
            is24Hour
            onChange={(_, d) => d && setDraft(parseTime(timeOfDate(d)))}
          />
        ) : (
          <View style={styles.wheels}>
            <Wheel label="Horas" values={wheelRange(23)} value={draft.hour} onChange={(hour) => setDraft({ ...draft, hour })} />
            <Text style={styles.colon}>:</Text>
            <Wheel label="Minutos" values={wheelRange(59)} value={draft.minute} onChange={(minute) => setDraft({ ...draft, minute })} />
          </View>
        )}
      </Sheet>
    </>
  )
}

interface DateFieldProps {
  label: string
  value: string
  onChange: (day: string) => void
  minimumDate?: Date
}

export function DateField({ label, value, onChange, minimumDate }: DateFieldProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(parseDay(value))

  function show() {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: parseDay(value),
        mode: 'date',
        display: 'calendar',
        minimumDate,
        onChange: (e: DateTimePickerEvent, d?: Date) => {
          if (e.type === 'set' && d) onChange(formatDay(d))
        },
      })
      return
    }
    setDraft(parseDay(value))
    setOpen(true)
  }

  const year = new Date().getFullYear()
  const daysInMonth = new Date(draft.getFullYear(), draft.getMonth() + 1, 0).getDate()
  const setPart = (y: number, m: number, d: number) => setDraft(new Date(y, m, Math.min(d, new Date(y, m + 1, 0).getDate())))

  return (
    <>
      <FieldButton label={label} value={dayLabel(value)} icon="calendar" onPress={show} />
      <Sheet visible={open} title={label} onCancel={() => setOpen(false)} onConfirm={() => { onChange(formatDay(draft)); setOpen(false) }}>
        {Platform.OS === 'ios' ? (
          <DateTimePicker value={draft} mode="date" display="inline" locale="pt-BR" minimumDate={minimumDate} onChange={(_, d) => d && setDraft(d)} />
        ) : (
          <View style={styles.wheels}>
            <Wheel label="Dia" values={wheelRange(daysInMonth - 1).map((i) => i + 1)} value={draft.getDate()} onChange={(d) => setPart(draft.getFullYear(), draft.getMonth(), d)} width={72} />
            <Wheel label="Mês" values={wheelRange(11).map((i) => i + 1)} value={draft.getMonth() + 1} onChange={(m) => setPart(draft.getFullYear(), m - 1, draft.getDate())} width={72} />
            <Wheel label="Ano" values={[year, year + 1]} value={draft.getFullYear()} onChange={(y) => setPart(y, draft.getMonth(), draft.getDate())} format={String} width={96} />
          </View>
        )}
      </Sheet>
    </>
  )
}

interface DurationFieldProps {
  label: string
  minutes: number
  onChange: (minutes: number) => void
  min?: number
  max?: number
}

export function DurationField({ label, minutes, onChange, min = 1, max = 600 }: DurationFieldProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState({ h: Math.floor(minutes / 60), m: minutes % 60 })
  const total = draft.h * 60 + draft.m

  return (
    <>
      <FieldButton label={label} value={durationLabel(minutes)} icon="timer" onPress={() => { setDraft({ h: Math.floor(minutes / 60), m: minutes % 60 }); setOpen(true) }} />
      <Sheet visible={open} title={label} onCancel={() => setOpen(false)} onConfirm={() => { onChange(clampMinutes(total, min, max)); setOpen(false) }}>
        <View style={styles.wheels}>
          <Wheel label="Horas" values={wheelRange(Math.floor(max / 60))} value={draft.h} onChange={(h) => setDraft({ ...draft, h })} format={(v) => `${v} h`} />
          <Wheel label="Minutos" values={wheelRange(59)} value={draft.m} onChange={(m) => setDraft({ ...draft, m })} format={(v) => `${String(v).padStart(2, '0')} min`} width={110} />
        </View>
        <Text style={styles.total}>{total < min ? `Mínimo de ${durationLabel(min)}` : total > max ? `Máximo de ${durationLabel(max)}` : durationLabel(total)}</Text>
      </Sheet>
    </>
  )
}

const styles = StyleSheet.create({
  group: { marginBottom: spacing[4] },
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink, marginBottom: spacing[2] },
  button: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 56, paddingHorizontal: spacing[4], borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.md, backgroundColor: colors.bgSurface },
  pressed: { backgroundColor: colors.bgMuted },
  value: { flex: 1, fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  change: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, textDecorationLine: 'underline' },
  wheels: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2] },
  colon: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
  total: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginTop: spacing[2] },
})
