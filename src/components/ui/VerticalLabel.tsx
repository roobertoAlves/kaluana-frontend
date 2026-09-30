import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from '../../styles/tokens'

const BOX_WIDTH = 20
const BOX_HEIGHT = 150
const LINE_HEIGHT = 16

/**
 * Rótulo vertical (`writing-mode: vertical-rl`) no canto inferior esquerdo.
 * O texto é alinhado à direita e girado 90°, então termina rente à base.
 */
export function VerticalLabel({ text }: { text: string }) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.box, { bottom: 32 + insets.bottom }]} pointerEvents="none">
      <Text style={styles.text} accessible={false}>
        {text}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    left: 8,
    width: BOX_WIDTH,
    height: BOX_HEIGHT,
    zIndex: 3,
  },
  text: {
    position: 'absolute',
    width: BOX_HEIGHT,
    height: LINE_HEIGHT,
    left: BOX_WIDTH / 2 - BOX_HEIGHT / 2,
    top: BOX_HEIGHT / 2 - LINE_HEIGHT / 2,
    transform: [{ rotate: '90deg' }],
    textAlign: 'right',
    fontFamily: fonts.display,
    fontSize: 11,
    lineHeight: LINE_HEIGHT,
    letterSpacing: 2,
    color: colors.white,
    textTransform: 'uppercase',
  },
})
