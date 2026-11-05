import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { SmallButton } from '../../components/ui/forms'
import { Icon } from '../../components/ui/Icons'
import { resendConfirmation } from '../../services/api'
import { errorMessage } from '../../services/http'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'CheckEmail'>


export function CheckEmailScreen({ navigation, route }: Props) {
  const { email } = route.params
  const [status, setStatus] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function resend() {
    setSending(true)
    setStatus(null)
    try {
      await resendConfirmation(email)
      setStatus('Enviamos um link novo. Os anteriores deixam de valer.')
    } catch (e) {
      setStatus(errorMessage(e, 'Não foi possível reenviar agora. Tente de novo em instantes.'))
    } finally {
      setSending(false)
    }
  }

  return (
    <Screen label="KALUANA · CONTA" title="Confirme seu e-mail" onBack={() => navigation.navigate('ProfileSelection')}>
      <View style={styles.card}>
        <Icon name="mail" size={28} />
        <Text style={styles.text}>
          Enviamos um link para <Text style={styles.email}>{email}</Text>. Abra o e-mail e toque em “Confirmar meu e-mail”: sua conta fica ativa na hora.
        </Text>
        <Text style={styles.hint}>O link vale por 24 horas. Não achou? Olhe a caixa de spam.</Text>
      </View>

      <ArrowButton label="Já confirmei, entrar" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })} />
      <View style={styles.resend}>
        <SmallButton label={sending ? 'Enviando...' : 'Reenviar e-mail'} onPress={() => void resend()} />
      </View>
      {status && (
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {status}
        </Text>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[4], gap: spacing[3], marginBottom: spacing[5] },
  text: { fontFamily: fonts.body, fontSize: 17, lineHeight: 24, color: colors.ink },
  email: { fontFamily: fonts.bodyBold },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  resend: { alignItems: 'center', marginTop: spacing[2] },
  status: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing[2] },
})
