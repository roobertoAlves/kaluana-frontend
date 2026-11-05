import { StyleSheet, View, useWindowDimensions } from 'react-native'
import Svg, { Polygon } from 'react-native-svg'
import { colors } from '../../styles/tokens'

interface WedgeBackgroundProps {
  height: number
  narrowWidth?: number
}

export function WedgeBackground({ height, narrowWidth = 120 }: WedgeBackgroundProps) {
  const { width } = useWindowDimensions()

  return (
    <View style={[styles.wrapper, { height, width }]} pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polygon points={`0,0 ${width},0 ${narrowWidth},${height} 0,${height}`} fill={colors.darkWedge} />
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
})
