import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { colors, fonts } from '../../styles/tokens'

type MenuRoute = 'Home' | 'Profile' | 'Settings'

const MENU_ITEMS: { label: string; icon: string; route: MenuRoute }[] = [
  { label: 'Início', icon: '🏠', route: 'Home' },
  { label: 'Perfil', icon: '👤', route: 'Profile' },
  { label: 'Config', icon: '⚙️', route: 'Settings' },
]

export function BottomMenu() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.nav, { height: 64 + insets.bottom, paddingBottom: insets.bottom }]}>
      {MENU_ITEMS.map((item) => {
        const active = route.name === item.route
        return (
          <Pressable
            key={item.route}
            onPress={() => {
              if (!active) navigation.replace(item.route)
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            style={styles.button}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, { color: active ? colors.menuActive : colors.menuInactive }]}>
              {item.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.menuBorder,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
    padding: 8,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 12,
  },
})
