import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { SidebarScreen } from '../../components/ui/SidebarScreen'
import { BackButton } from '../../components/ui/BackButton'
import { AuthFooterLinks, AuthHero, AuthSubtitle } from '../../components/ui/AuthHero'
import { CoordinateField } from '../../components/ui/CoordinateField'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { SocialRow } from '../../components/ui/SocialRow'
import { useAuth } from '../../context/AuthContext'
import { login, ApiError } from '../../services/api'
import { getApiBaseUrl } from '../../services/runtimeConfig'
import { hostnameOf } from '../../features/api/apiAddress'
import { colors, fonts } from '../../styles/tokens'
import { ServerSheet } from './ServerSheet'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>

export function LoginScreen({ navigation }: Props) {
  const { setSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverOpen, setServerOpen] = useState(false)

  async function handleSubmit() {
    setFormError(null)

    if (!/^\S+@\S+\.\S+$/.test(email.trim()) || password.length < 8) {
      setFormError('Confira o e-mail e a senha (mínimo de 8 caracteres).')
      return
    }

    setSubmitting(true)
    try {
      const auth = await login({ email: email.trim(), password })
      setSession(auth)
      navigation.reset({ index: 0, routes: [{ name: 'LoginSuccess' }] })
    } catch (error) {

      if (error instanceof ApiError && error.status === 403) {
        navigation.navigate('CheckEmail', { email: email.trim() })
        return
      }
      setFormError(error instanceof ApiError ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidebarScreen
      label="ACESSO"
      paddingTop={100}
      paddingBottom={48}
      toastMessage={formError}
      onDismissToast={() => setFormError(null)}
    >
      <BackButton onPress={() => navigation.navigate('ProfileSelection')} />

      <AuthHero title={'bem-vindo\nde volta.'} maxTitleWidth={220} marginBottom={28} />

      <AuthSubtitle>
        {'Sua rotina está esperando por você.\nEntre e continue de onde parou.'}
      </AuthSubtitle>

      <View style={{ alignItems: 'center' }}>
        <CoordinateField
          onDark
          coordinate="B2"
          label="E-MAIL"
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <CoordinateField
          onDark
          coordinate="C3"
          label="SENHA"
          placeholder="sua senha"
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />

        <SocialRow verb="Entrar" />

        <ArrowButton label={submitting ? 'ENTRANDO...' : 'ENTRAR'} loading={submitting} onPress={handleSubmit} />
      </View>

      <AuthFooterLinks />
      <Pressable onPress={() => setServerOpen(true)} accessibilityRole="button" accessibilityLabel="Alterar o servidor da API" hitSlop={8} style={styles.server}>
        <Text style={styles.serverText}>servidor: {hostnameOf(getApiBaseUrl())} · alterar</Text>
      </Pressable>
      {serverOpen && <ServerSheet visible onClose={() => setServerOpen(false)} />}
    </SidebarScreen>
  )
}

const styles = StyleSheet.create({
  server: { alignSelf: 'center', minHeight: 44, justifyContent: 'center' },
  serverText: { fontFamily: fonts.body, fontSize: 12.8, color: colors.inkSoft, textDecorationLine: 'underline' },
})
