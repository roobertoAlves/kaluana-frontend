import { StyleSheet, Text } from 'react-native'
import type { PressableProps } from 'react-native'
import { PressableScale } from '../motion/PressableScale'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type ArrowButtonVariant = 'primary' | 'secondary'

interface ArrowButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string
  variant?: ArrowButtonVariant
  /** Bloqueia toques repetidos enquanto a requisição está em andamento. */
  loading?: boolean
}

/**
 * Botão retangular com o texto à esquerda e a seta "→" à direita, como no base.
 * Afunda levemente ao toque (sem animação se o sistema pedir menos movimento).
 */
export function ArrowButton({ label, variant = 'primary', loading = false, disabled, ...rest }: ArrowButtonProps) {
  const isPrimary = variant === 'primary'
  const isDisabled = Boolean(disabled) || loading

  return (
    <PressableScale
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
        isDisabled && styles.disabled,
      ]}
      {...rest}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.arrow}>→</Text>
    </PressableScale>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    minHeight: 52,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: radius.sm,
  },
  disabled: { opacity: 0.6 },
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
