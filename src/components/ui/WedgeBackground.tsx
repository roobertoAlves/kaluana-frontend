import { StyleSheet, View, useWindowDimensions } from 'react-native'
import Svg, { Polygon } from 'react-native-svg'
import { colors } from '../../styles/tokens'

interface WedgeBackgroundProps {
  height: number
  narrowWidth?: number
}

/**
 * Porte do clip-path: polygon(0 0, 100% 0, 120px 100%, 0 100%) usado em
 * PrimaryRegisterScreen.module.css/.sidebar. React Native não tem
 * clip-path, então o mesmo polígono é desenhado com react-native-svg,
 * usando a largura real da tela (não percentual) para o cálculo do
 * ponto de afunilamento ficar exato em pixels, como no CSS original.
 */
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
