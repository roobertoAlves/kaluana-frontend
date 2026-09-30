import { StyleSheet } from 'react-native'
import Svg, { Circle, Defs, Pattern, Rect } from 'react-native-svg'
import { colors } from '../../styles/tokens'

/**
 * Fundo pontilhado das telas: equivale ao
 * `radial-gradient(sand 1px, transparent 1px)` com `background-size: 24px`
 * do projeto base.
 */
export function DotGrid() {
  return (
    <Svg style={styles.fill}>
      <Defs>
        <Pattern id="kaluana-dots" width={24} height={24} patternUnits="userSpaceOnUse">
          <Circle cx={12} cy={12} r={1} fill={colors.sand} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#kaluana-dots)" />
    </Svg>
  )
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
})
