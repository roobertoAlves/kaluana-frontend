import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { FadeIn } from '../motion/FadeIn'
import { PressableScale } from '../motion/PressableScale'
import type { TextInputProps } from 'react-native'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

export function ChipGroup<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <View style={styles.group} accessibilityRole="radiogroup">
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((o) => {
          const on = o.value === value
          return (
            <PressableScale
              key={String(o.value)}
              onPress={() => onChange(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[styles.chip, on && styles.chipOn]}
            >
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
            </PressableScale>
          )
        })}
      </View>
    </View>
  )
}

export function Field({ label, error, ...rest }: TextInputProps & { label: string; error?: string | null }) {
  return (
    <View style={styles.group}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.sand}
        style={[styles.input, error ? styles.inputError : null]}
        {...rest}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  )
}

export function SmallButton({ label, onPress, danger }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" style={styles.small}>
      <Text style={[styles.smallText, danger && { color: colors.danger }]}>{label}</Text>
    </Pressable>
  )
}

export function Card({ children }: { children: React.ReactNode }) {
  return <FadeIn style={styles.card}>{children}</FadeIn>
}

export const formStyles = StyleSheet.create({
  muted: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  sectionTitle: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.ink, marginTop: spacing[6], marginBottom: spacing[3] },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing[3] },
  itemTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
})

const styles = StyleSheet.create({
  group: { marginBottom: spacing[4] },
  fieldLabel: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink, marginBottom: spacing[2] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: { minHeight: 48, justifyContent: 'center', paddingHorizontal: spacing[4], borderWidth: 1, borderColor: colors.ink, borderRadius: radius.sm, backgroundColor: colors.bgSurface },
  chipOn: { backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  chipTextOn: { color: colors.white, fontFamily: fonts.bodyBold },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.sand, borderRadius: radius.sm, backgroundColor: colors.bgSurface, paddingHorizontal: spacing[3], paddingVertical: spacing[3], fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: spacing[1] },
  small: { minHeight: 44, justifyContent: 'center' },
  smallText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, textDecorationLine: 'underline' },
  card: { backgroundColor: colors.bgSurface, padding: spacing[4], borderRadius: radius.sm, borderLeftWidth: 2, borderLeftColor: colors.emberBright, marginBottom: spacing[3] },
})
