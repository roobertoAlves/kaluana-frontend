import { StyleSheet } from 'react-native'
import Svg, { Polygon } from 'react-native-svg'
import { colors } from '../../styles/tokens'

const TOP_WIDTH = 300
const BOTTOM_WIDTH = 120

export function SidebarWedge() {
  return (
    <Svg
      style={styles.wedge}
      width="100%"
      height="100%"
      viewBox={`0 0 ${TOP_WIDTH} 100`}
      preserveAspectRatio="none"
    >
      <Polygon points={`0,0 ${TOP_WIDTH},0 ${BOTTOM_WIDTH},100 0,100`} fill={colors.ink} />
    </Svg>
  )
}

const styles = StyleSheet.create({
  wedge: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: TOP_WIDTH,
    height: '100%',
    pointerEvents: 'none',
  },
})
