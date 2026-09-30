import { Pressable, StyleSheet, Text } from 'react-native'
import { colors, fonts } from '../../styles/tokens'

interface BackButtonProps {
  onPress: () => void
  spacing?: number
}

/**
 * "← VOLTAR" em branco com mix-blend-mode: difference, como no base:
 * fica claro sobre a faixa azul e escuro quando sai dela.
 */
export function BackButton({ onPress, spacing = 32 }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Voltar para a tela anterior"
      style={[styles.button, { marginBottom: spacing }]}
    >
      <Text style={styles.text}>← VOLTAR</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    mixBlendMode: 'difference',
  },
  text: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 0.88,
    color: colors.white,
    textTransform: 'uppercase',
  },
})
