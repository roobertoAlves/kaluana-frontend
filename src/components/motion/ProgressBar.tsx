import { useEffect, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { colors } from '../../styles/tokens'
import { motion, useReducedMotion } from './useReducedMotion'

/** Barra fina de progresso (0 a 1), animada ao mudar. Usada nas microetapas. */
export function ProgressBar({ value, color = colors.sageBright }: { value: number; color?: string }) {
  const reduced = useReducedMotion()
  const [width] = useState(() => new Animated.Value(value))

  useEffect(() => {
    if (reduced) width.setValue(value)
    else Animated.timing(width, { toValue: value, duration: motion.slow, useNativeDriver: false }).start()
  }, [value, reduced, width])

  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Animated.View
        style={[styles.fill, { backgroundColor: color, width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: { height: 4, borderRadius: 2, backgroundColor: colors.cream, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
})
