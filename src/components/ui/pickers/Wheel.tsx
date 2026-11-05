import { useEffect, useRef } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollViewInstance } from 'react-native'
import { colors, fonts } from '../../../styles/tokens'

export const ITEM_HEIGHT = 48
const VISIBLE = 5

interface Props {
  values: number[]
  value: number
  onChange: (v: number) => void
  format?: (v: number) => string
  label: string
  width?: number
}

export function Wheel({ values, value, onChange, format = (v) => String(v).padStart(2, '0'), label, width = 88 }: Props) {
  const ref = useRef<ScrollViewInstance>(null)
  const index = Math.max(0, values.indexOf(value))

  useEffect(() => {
    ref.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function settle(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)
    const v = values[Math.max(0, Math.min(values.length - 1, i))]
    if (v !== value) onChange(v)
  }

  function step(delta: number) {
    const i = Math.max(0, Math.min(values.length - 1, index + delta))
    ref.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true })
    onChange(values[i])
  }

  return (
    <View
      style={[styles.box, { width }]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: format(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
    >
      <View pointerEvents="none" style={styles.selection} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={settle}
        onScrollEndDrag={(e) => {
          if (!e.nativeEvent.velocity?.y) settle(e)
        }}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE / 2) }}
      >
        {values.map((v) => (
          <View key={v} style={styles.item}>
            <Text style={[styles.text, v === value && styles.textOn]}>{format(v)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { height: ITEM_HEIGHT * VISIBLE, overflow: 'hidden' },
  selection: { position: 'absolute', left: 0, right: 0, top: ITEM_HEIGHT * Math.floor(VISIBLE / 2), height: ITEM_HEIGHT, borderRadius: 8, backgroundColor: colors.cream },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.displayMedium, fontSize: 22, color: colors.sand },
  textOn: { fontFamily: fonts.display, fontSize: 26, color: colors.ink },
})
