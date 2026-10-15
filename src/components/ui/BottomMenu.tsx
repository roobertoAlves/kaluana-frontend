import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Line, Rect, Circle } from 'react-native-svg'
import { colors, fonts, spacing } from '../../styles/tokens'

export type BottomMenuTab = 'inicio' | 'perfil' | 'configuracoes'

interface BottomMenuProps {
  active: BottomMenuTab
  onNavigate: (tab: BottomMenuTab) => void
}

function IconHome({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Line x1="2" y1="9" x2="10" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Line x1="10" y1="2" x2="18" y2="9" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Rect x="5" y="9" width="10" height="9" stroke={color} strokeWidth="1.5" />
      <Rect x="8" y="13" width="4" height="5" stroke={color} strokeWidth="1.5" />
    </Svg>
  )
}

function IconPerson({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Circle cx="10" cy="6" r="3.5" stroke={color} strokeWidth="1.5" />
      <Line x1="3" y1="18" x2="17" y2="18" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Line x1="3" y1="18" x2="4.5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Line x1="17" y1="18" x2="15.5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Line x1="4.5" y1="12" x2="15.5" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
    </Svg>
  )
}

function IconSettings({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Line x1="2" y1="5" x2="18" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Line x1="2" y1="10" x2="18" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Line x1="2" y1="15" x2="18" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="square" />
      <Rect x="5" y="3" width="4" height="4" fill={colors.bgSurface} stroke={color} strokeWidth="1.5" />
      <Rect x="11" y="8" width="4" height="4" fill={colors.bgSurface} stroke={color} strokeWidth="1.5" />
    </Svg>
  )
}

const ITEMS: { key: BottomMenuTab; label: string; Icon: React.FC<{ color: string }> }[] = [
  { key: 'inicio', label: 'Início', Icon: IconHome },
  { key: 'perfil', label: 'Perfil', Icon: IconPerson },
  { key: 'configuracoes', label: 'Config.', Icon: IconSettings },
]

export function BottomMenu({ active, onNavigate }: BottomMenuProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing[3]) }]}>
      {ITEMS.map(({ key, label, Icon }) => {
        const isActive = key === active
        const color = isActive ? colors.emberBright : colors.sand
        return (
          <Pressable
            key={key}
            onPress={() => onNavigate(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={styles.item}
          >
            <Icon color={color} />
            <Text style={[styles.label, { color }]}>{label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.cream,
    backgroundColor: colors.bgSurface,
    paddingTop: spacing[2],
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
    paddingVertical: spacing[1],
  },
  label: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
})
