import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { SidebarScreen } from '../../components/ui/SidebarScreen'
import { BackButton } from '../../components/ui/BackButton'
import { AuthFooterLinks, AuthHero, AuthSubtitle } from '../../components/ui/AuthHero'
import { CoordinateField } from '../../components/ui/CoordinateField'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { useAuth } from '../../context/AuthContext'
import { validateCode, registerResponsible, ApiError } from '../../services/api'
import { colors, fonts } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'ResponsibleRegister'>

type Step = 'code' | 'register'

interface RegisterForm {
  name: string
  email: string
  password: string
}

export function ResponsibleRegisterScreen({ navigation }: Props) {
  const { setSession } = useAuth()

  const [step, setStep] = useState<Step>('code')
  const [code, setCode] = useState('')
  const [mainPersonName, setMainPersonName] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)

  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleValidateCode() {
    setCodeError(null)
    if (code.trim().length < 4) {
      setCodeError('Digite o código enviado pela pessoa principal.')
      return
    }

    setValidating(true)
    try {
      const result = await validateCode({ code: code.trim() })
      setMainPersonName(result.mainPersonName)
      setStep('register')
    } catch (error) {
      setCodeError(error instanceof ApiError ? error.message : 'Não foi possível validar o código.')
    } finally {
      setValidating(false)
    }
  }

  function update<K extends keyof RegisterForm>(field: K, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validateForm(): string | null {
    if (form.name.trim().length < 2) return 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'Informe um e-mail válido.'
    if (form.password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
    return null
  }

  async function handleSubmitRegister() {
    setFormError(null)

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setSubmitting(true)
    try {
      const auth = await registerResponsible({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        code: code.trim(),
      })
      setSession(auth)
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidebarScreen
      label={step === 'code' ? 'CÓDIGO' : 'NOVA CONTA'}
      paddingTop={100}
      paddingBottom={48}
      toastMessage={formError}
      onDismissToast={() => setFormError(null)}
    >
      <BackButton onPress={() => navigation.navigate('ProfileSelection')} />

      {step === 'code' ? (
        <>
          <AuthHero title={'sou\nresponsável\npor alguém.'} maxTitleWidth={220} marginBottom={28} />

          <AuthSubtitle>
            {'A pessoa que você acompanha gerou um código\nno app dela. Use-o para se conectar.'}
          </AuthSubtitle>

          <View style={styles.form}>
            <CoordinateField
              onDark
              coordinate="A1"
              label="CÓDIGO"
              placeholder="Ex.: 7F3K9A"
              autoCapitalize="characters"
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
            />
            {codeError && (
              <Text style={styles.codeError} accessibilityRole="alert">
                {codeError}
              </Text>
            )}
            <ArrowButton
              label={validating ? 'VERIFICANDO...' : 'USAR CÓDIGO'}
              loading={validating}
              onPress={handleValidateCode}
            />
          </View>

          <AuthFooterLinks />
        </>
      ) : (
        <>
          <AuthHero title={'vamos\nte conhecer\nmelhor.'} maxTitleWidth={220} marginBottom={28} />

          <AuthSubtitle>
            {'Só o necessário para começar.\nVocê vai se conectar com '}
            <Text style={styles.bold}>{mainPersonName}</Text>.
          </AuthSubtitle>

          <View style={styles.form}>
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
            <ArrowButton
              label={submitting ? 'CRIANDO...' : 'CRIAR CONTA'}
              loading={submitting}
              onPress={handleSubmitRegister}
            />
          </View>

          <AuthFooterLinks />
        </>
      )}
    </SidebarScreen>
  )
}

const styles = StyleSheet.create({
  form: {
    alignItems: 'center',
    flex: 1,
  },
  codeError: {
    fontFamily: fonts.body,
    fontSize: 13.6,
    color: colors.danger,
    alignSelf: 'flex-start',
    marginTop: -12,
    marginBottom: 16,
  },
  bold: {
    fontFamily: fonts.bodyBold,
  },
})
