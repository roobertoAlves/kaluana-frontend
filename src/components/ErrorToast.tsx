import { useEffect, useState } from 'react'
import { AccessibilityInfo, Animated, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts, radius, spacing } from '../styles/tokens'

interface ErrorToastProps {
  message: string | null
  onDismiss: () => void
  duration?: number
}

/**
 * Equivalente do ErrorToast do projeto base (que usa @radix-ui/react-toast,
 * inexistente em React Native): faixa vermelha na parte de baixo, entra
 * deslizando, some sozinha após `duration` e é anunciada por leitor de tela.
 */
export function ErrorToast({ message, onDismiss, duration = 6000 }: ErrorToastProps) {
  const insets = useSafeAreaInsets()
  const [translateY] = useState(() => new Animated.Value(80))
  const [opacity] = useState(() => new Animated.Value(0))

  useEffect(() => {
    if (!message) return undefined

    AccessibilityInfo.announceForAccessibility(message)

    Animated.parallel([
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 80, duration: 150, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => onDismiss())
    }, duration)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  if (!message) return null

  return (
    <Animated.View
      style={[
        styles.root,
        { bottom: spacing[5] + insets.bottom, transform: [{ translateY }], opacity },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: spacing[6],
    right: spacing[6],
    alignSelf: 'center',
    maxWidth: 480,
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing[4],
    shadowColor: colors.ink,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    zIndex: 100,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.white,
  },
})
