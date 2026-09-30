import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { GestureResponderEvent } from 'react-native'
import Svg, { Polygon } from 'react-native-svg'
import { colors, fonts } from '../../styles/tokens'

interface DiagonalOptionProps {
  number: string
  title: string
  description: string
  color: string
  onPress: () => void
  /** Posição na pilha: o primeiro bloco fica por cima dos seguintes. */
  index: number
  /** Ação do bloco logo abaixo, para toques que caem no triângulo dele. */
  onPressNext?: () => void
}

export const OPTION_HEIGHT = 130
export const OPTION_CUT = 28

/**
 * Bloco de cor com cortes diagonais em cima e embaixo (clip-path do base).
 * Os blocos se sobrepõem em 28px para que a diagonal de baixo de um encaixe
 * na de cima do próximo. Como em RN o toque vale para o retângulo inteiro,
 * o bloco de cima repassa ao de baixo o toque que cai na área dele, e o
 * primeiro ignora toques no triângulo vazio do topo.
 */
export function DiagonalOption({
  number,
  title,
  description,
  color,
  onPress,
  index,
  onPressNext,
}: DiagonalOptionProps) {
  const [width, setWidth] = useState(0)

  function handlePress(event: GestureResponderEvent) {
    const { locationX, locationY } = event.nativeEvent
    const ratio = width > 0 ? locationX / width : 0
    const bottomEdge = OPTION_HEIGHT - OPTION_CUT * ratio
    const topEdge = OPTION_CUT * (1 - ratio)

    if (onPressNext && locationY > bottomEdge) {
      onPressNext()
    } else if (index === 0 && locationY < topEdge) {
      // triângulo vazio acima do primeiro bloco
    } else {
      onPress()
    }
  }

  return (
    <Pressable
      onPress={handlePress}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [
        styles.option,
        { zIndex: 3 - index, marginTop: index === 0 ? 0 : -OPTION_CUT },
        pressed && styles.pressed,
      ]}
    >
      <Svg
        style={StyleSheet.absoluteFill}
        width="100%"
        height="100%"
        viewBox={`0 0 100 ${OPTION_HEIGHT}`}
        preserveAspectRatio="none"
      >
        <Polygon
          points={`0,${OPTION_CUT} 100,0 100,${OPTION_HEIGHT - OPTION_CUT} 0,${OPTION_HEIGHT}`}
          fill={color}
        />
      </Svg>
      <View style={styles.inner} pointerEvents="none">
        <View style={styles.texts}>
          <Text style={styles.number}>{number}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  option: {
    width: '100%',
    height: OPTION_HEIGHT,
  },
  pressed: {
    opacity: 0.9,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 36,
    paddingHorizontal: 20,
  },
  texts: {
    flex: 1,
  },
  number: {
    fontFamily: fonts.display,
    fontSize: 11,
    letterSpacing: 1.1,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 27.2,
    lineHeight: 27.2,
    color: colors.white,
    marginBottom: 4,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  arrow: {
    fontFamily: fonts.display,
    fontSize: 22.4,
    color: colors.white,
    marginLeft: 12,
  },
})
