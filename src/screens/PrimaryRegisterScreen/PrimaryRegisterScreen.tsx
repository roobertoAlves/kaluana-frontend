import { useState } from 'react'
import { View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { SidebarScreen } from '../../components/ui/SidebarScreen'
import { BackButton } from '../../components/ui/BackButton'
import { AuthFooterLinks, AuthHero } from '../../components/ui/AuthHero'
import { CoordinateField } from '../../components/ui/CoordinateField'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { SocialRow } from '../../components/ui/SocialRow'
import { useAuth } from '../../context/AuthContext'
import { registerPrimary, ApiError } from '../../services/api'
import { isPendingConfirmation } from '../../types'

type Props = NativeStackScreenProps<RootStackParamList, 'PrimaryRegister'>

interface FormState {
  name: string
  email: string
  password: string
}

export function PrimaryRegisterScreen({ navigation }: Props) {
  const { setSession } = useAuth()
  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof FormState>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate(): string | null {
    if (form.name.trim().length < 2) return 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Informe um e-mail válido.'
    if (form.password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
    return null
  }

  async function handleSubmit() {
    setFormError(null)

    const validationError = validate()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSubmitting(true)
    try {
      const auth = await registerPrimary({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      // Com confirmação de e-mail ligada, a conta só entra depois do clique no link.
      if (isPendingConfirmation(auth)) {
        navigation.reset({ index: 0, routes: [{ name: 'CheckEmail', params: { email: auth.user.email } }] })
        return
      }
      setSession(auth)
      navigation.reset({ index: 0, routes: [{ name: 'LoginSuccess' }] })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidebarScreen
      label="NOVA CONTA"
      paddingTop={72}
      paddingBottom={32}
      toastMessage={formError}
      onDismissToast={() => setFormError(null)}
    >
      <BackButton onPress={() => navigation.navigate('ProfileSelection')} spacing={28} />

      <AuthHero title={'vamos\nte conhecer\nmelhor.'} blend marginBottom={32} />

      <View style={{ alignItems: 'center', flex: 1 }}>
        <CoordinateField
          onDark
          coordinate="A1"
          label="NOME"
          placeholder="como prefere ser chamado(a)?"
          autoComplete="name"
          value={form.name}
          onChangeText={(v) => update('name', v)}
        />
        <CoordinateField
          onDark
          coordinate="B2"
          label="E-MAIL"
          placeholder="voce@exemplo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={form.email}
          onChangeText={(v) => update('email', v)}
        />
        <CoordinateField
          onDark
          coordinate="C3"
          label="SENHA"
          placeholder="mínimo de 8 caracteres"
          secureTextEntry
          autoComplete="password-new"
          value={form.password}
          onChangeText={(v) => update('password', v)}
        />

        <SocialRow verb="Registrar" />

        <ArrowButton
          label={submitting ? 'CRIANDO...' : 'CRIAR CONTA'}
          loading={submitting}
          onPress={handleSubmit}
        />
      </View>

      <AuthFooterLinks />
    </SidebarScreen>
  )
}
