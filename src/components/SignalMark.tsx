import { Image } from 'expo-image'
import { StyleSheet, View } from 'react-native'
import { colors } from '../styles/tokens'

interface SignalMarkProps {
  size?: number
}

export function SignalMark({ size = 56 }: SignalMarkProps) {
  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={{ width: size * 0.85, height: size * 0.85, transform: [{ rotate: '-45deg' }] }}
        contentFit="contain"
        accessibilityIgnoresInvertColors
        accessible={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    transform: [{ rotate: '45deg' }],
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.emberBright,
    backgroundColor: colors.paper,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
})
