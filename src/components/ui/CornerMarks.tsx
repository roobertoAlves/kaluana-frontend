import { StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from '../../styles/tokens'

type Corner = 'tl' | 'tr' | 'bl' | 'br'

interface CornerMarksProps {
  corners?: Corner[]
}

const INSET = 12

export function CornerMarks({ corners = ['tl', 'tr', 'bl', 'br'] }: CornerMarksProps) {
  const insets = useSafeAreaInsets()

  const positions: Record<Corner, object> = {
    tl: { top: INSET + insets.top, left: INSET },
    tr: { top: INSET + insets.top, right: INSET },
    bl: { bottom: INSET + insets.bottom, left: INSET },
    br: { bottom: INSET + insets.bottom, right: INSET },
  }

  return (
    <>
      {corners.map((corner) => (
        <Text key={corner} style={[styles.mark, positions[corner]]} accessible={false}>
          +
        </Text>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  mark: {
    position: 'absolute',
    fontFamily: fonts.display,
    fontSize: 12,
    color: colors.ink,
    zIndex: 10,
  },
})
