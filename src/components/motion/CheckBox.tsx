import { useEffect, useState } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'
import { Icon } from '../ui/Icons'
import { colors, radius } from '../../styles/tokens'
import { motion, useReducedMotion } from './useReducedMotion'

interface CheckBoxProps {
  checked: boolean
  onToggle: () => void
  label: string
  size?: number
}

export function CheckBox({ checked, onToggle, label, size = 26 }: CheckBoxProps) {
  const reduced = useReducedMotion()
  const [scale] = useState(() => new Animated.Value(checked ? 1 : 0))

  useEffect(() => {
    if (reduced) {
      scale.setValue(checked ? 1 : 0)
      return
    }
    Animated.spring(scale, { toValue: checked ? 1 : 0, speed: 24, bounciness: 8, useNativeDriver: true }).start()
  }, [checked, reduced, scale])

  return (
    <Pressable
      onPress={onToggle}
      hitSlop={9}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={[styles.box, { width: size, height: size }, checked && styles.boxOn]}
    >
      <Animated.View style={{ transform: [{ scale }], opacity: scale }}>
        <Icon name="check" size={size - 6} color={colors.white} />
      </Animated.View>
    </Pressable>
  )
}

export const CHECK_ANIMATION_MS = motion.base

const styles = StyleSheet.create({
  box: { borderWidth: 2, borderColor: colors.ink, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgSurface },
  boxOn: { backgroundColor: colors.ink },
})
