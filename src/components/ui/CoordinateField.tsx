import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { colors, fonts, spacing } from '../../styles/tokens'

interface CoordinateFieldProps extends TextInputProps {
  coordinate: string
  label: string
  /** Campos sobre a faixa azul usam texto e placeholder claros (como no base). */
  onDark?: boolean
}

/**
 * Campo "coordenada": código laranja (A1, B2...) + rótulo em caixa alta,
 * input sem caixa, só com linha laranja embaixo e placeholder em itálico.
 */
export function CoordinateField({
  coordinate,
  label,
  onDark = false,
  value,
  style,
  onFocus,
  onBlur,
  ...rest
}: CoordinateFieldProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = Boolean(value)

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.coordinate}>{coordinate}</Text>
        <Text style={[styles.label, { color: onDark ? colors.white : colors.ink }]}>{label}</Text>
      </View>
      <TextInput
        value={value}
        style={[
          styles.input,
          {
            color: onDark ? colors.white : colors.ink,
            borderBottomColor: focused ? colors.ember : colors.emberBright,
            fontFamily: hasValue ? fonts.body : fonts.bodyItalic,
          },
          style,
        ]}
        placeholderTextColor={onDark ? 'rgba(255,255,255,0.45)' : colors.sand}
        accessibilityLabel={label}
        onFocus={(e) => {
          setFocused(true)
          onFocus?.(e)
        }}
        onBlur={(e) => {
          setFocused(false)
          onBlur?.(e)
        }}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: spacing[6],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  coordinate: {
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.emberBright,
    textTransform: 'uppercase',
  },
  label: {
    fontFamily: fonts.displayMedium,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  input: {
    borderBottomWidth: 1,
    paddingVertical: spacing[3],
    paddingHorizontal: 0,
    fontSize: 16,
  },
})
