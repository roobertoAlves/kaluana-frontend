import { useState } from 'react'
import { Animated, Pressable } from 'react-native'
import type { PressableProps, PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native'
import { motion, useReducedMotion } from './useReducedMotion'

type Props = Omit<PressableProps, 'style'> & {
  /** Como no Pressable: estilo fixo ou função do estado (ex.: cor ao pressionar). */
  style?: StyleProp<ViewStyle> | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>)
  /** Layout do elemento externo, quando ele precisa ocupar espaço numa linha (ex.: flex: 1). */
  containerStyle?: StyleProp<ViewStyle>
}

/** Pressable que "afunda" 3% ao toque: confirmação imediata de que o toque pegou. */
export function PressableScale({ style, containerStyle, children, onPressIn, onPressOut, ...rest }: Props) {
  const reduced = useReducedMotion()
  const [scale] = useState(() => new Animated.Value(1))

  const to = (value: number) =>
    reduced ? undefined : Animated.timing(scale, { toValue: value, duration: motion.fast, useNativeDriver: true }).start()

  return (
    <Pressable
      {...rest}
      style={containerStyle}
      onPressIn={(e) => {
        to(0.97)
        onPressIn?.(e)
      }}
      onPressOut={(e) => {
        to(1)
        onPressOut?.(e)
      }}
    >
      {(state) => (
        <Animated.View style={[typeof style === 'function' ? style(state) : style, { transform: [{ scale }] }]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  )
}
