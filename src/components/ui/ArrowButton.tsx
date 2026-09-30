import { Pressable, StyleSheet, Text } from 'react-native'
import type { PressableProps } from 'react-native'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type ArrowButtonVariant = 'primary' | 'secondary'

interface ArrowButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string
  variant?: ArrowButtonVariant
  /** Bloqueia toques repetidos enquanto a requisição está em andamento. */
  loading?: boolean
}

/** Botão retangular com o texto à esquerda e a seta "→" à direita, como no base. */
export function ArrowButton({ label, variant = 'primary', loading = false, disabled, ...rest }: ArrowButtonProps) {
  const isPrimary = variant === 'primary'
  const isDisabled = Boolean(disabled) || loading

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary
            ? pressed
              ? colors.ember
              : colors.emberBright
            : pressed
              ? colors.inkSoft
              : colors.ink,
        },
      ]}
      {...rest}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: radius.sm,
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 14,
    letterSpacing: 0.7,
    color: colors.white,
    textTransform: 'uppercase',
  },
  arrow: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.white,
  },
})
