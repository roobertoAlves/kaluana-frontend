import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomMenu } from '../../components/BottomMenu/BottomMenu'
import { colors, fonts } from '../../styles/tokens'

export function ProfileScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: 20 + insets.top }]}>
        <Text accessibilityRole="header" style={styles.title}>
          Meu Perfil
        </Text>
        <Text style={styles.text}>Informações do usuário aparecerão aqui.</Text>
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
})
