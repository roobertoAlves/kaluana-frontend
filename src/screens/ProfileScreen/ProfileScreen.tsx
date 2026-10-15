import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { BottomMenu } from '../../components/ui/BottomMenu'
import { useAuth } from '../../context/AuthContext'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: spacing[5] + insets.top }]}>
        <Text style={styles.label}>KALUANA · PERFIL</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {user?.name ?? ''}
        </Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{user?.role === 'PRIMARY' ? 'USUÁRIO PRINCIPAL' : 'RESPONSÁVEL'}</Text>
        </View>
      </View>
      <BottomMenu
        active="perfil"
        onNavigate={(tab) => {
          if (tab === 'inicio') navigation.navigate('Home')
          if (tab === 'configuracoes') navigation.navigate('Settings')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  content: {
    flex: 1,
    padding: spacing[5],
  },
  label: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.emberBright,
    marginBottom: spacing[2],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    color: colors.ink,
    marginBottom: spacing[2],
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: spacing[4],
  },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.ink,
    paddingVertical: 4,
    paddingHorizontal: spacing[3],
  },
  badgeText: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.ink,
  },
})
