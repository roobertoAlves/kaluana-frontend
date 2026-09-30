import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, fonts, spacing } from '../../styles/tokens'

export type BottomMenuTab = 'inicio' | 'perfil' | 'configuracoes'

interface BottomMenuProps {
  active: BottomMenuTab
  onNavigate: (tab: BottomMenuTab) => void
}

const ITEMS: { key: BottomMenuTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'inicio', label: 'Início', icon: 'home' },
  { key: 'perfil', label: 'Perfil', icon: 'person' },
  { key: 'configuracoes', label: 'Config.', icon: 'settings' },
]

/**
 * Porte de src/components/BottomMenu/BottomMenu.tsx. A versão web usa
 * emoji (🏠👤⚙️) como ícone; aqui trocado por @expo/vector-icons
 * (Ionicons), que já vem com o Expo, renderiza de forma consistente
 * entre Android/iOS (emoji varia por fabricante) e aceita cor/tamanho
 * como as demais telas.
 */
export function BottomMenu({ active, onNavigate }: BottomMenuProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, spacing[3]) }]}>
      {ITEMS.map((item) => {
        const isActive = item.key === active
        return (
          <Pressable
            key={item.key}
            onPress={() => onNavigate(item.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            style={styles.item}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={isActive ? colors.emberBright : colors.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
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
    borderTopColor: colors.borderSubtle,
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
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.emberBright,
  },
})
