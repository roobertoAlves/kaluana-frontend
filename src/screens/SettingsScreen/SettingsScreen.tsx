import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { BottomMenu } from '../../components/BottomMenu/BottomMenu'
import { useAuth } from '../../context/AuthContext'
import { colors, fonts } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { clearSession } = useAuth()

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: 20 + insets.top }]}>
        <Text accessibilityRole="header" style={styles.title}>
          Configurações
        </Text>
        <Text style={styles.text}>Ajustes do aplicativo aparecerão aqui.</Text>

        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          style={styles.logout}
          onPress={() => {
            clearSession()
            navigation.reset({ index: 0, routes: [{ name: 'ProfileSelection' }] })
          }}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>
      <BottomMenu />
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
    padding: 20,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: colors.textPrimary,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    marginTop: 16,
  },
  logout: {
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  logoutText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
})
