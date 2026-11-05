import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Animated, Easing } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { motion, useReducedMotion } from './useReducedMotion'

interface FadeInProps {
  children: ReactNode
  index?: number
  style?: StyleProp<ViewStyle>
}

export function FadeIn({ children, index = 0, style }: FadeInProps) {
  const reduced = useReducedMotion()
  const [progress] = useState(() => new Animated.Value(reduced ? 1 : 0))

  useEffect(() => {
    if (reduced) {
      progress.setValue(1)
      return
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: motion.base,
      delay: Math.min(index, motion.maxStaggered) * motion.stagger,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [progress, index, reduced])

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] })
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>
}
