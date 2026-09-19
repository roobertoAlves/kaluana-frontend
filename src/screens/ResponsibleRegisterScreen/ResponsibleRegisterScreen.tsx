import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignalMark } from '../../components/SignalMark'
import { CoordinateField } from '../../components/ui/CoordinateField'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { ErrorToast } from '../../components/ErrorToast'
import { useAuth } from '../../context/AuthContext'
import { validateCode, registerResponsible, ApiError } from '../../services/api'
import styles from './ResponsibleRegisterScreen.module.css'

type Step = 'code' | 'register'

interface RegisterForm {
  name: string
  email: string
  password: string
}

export function ResponsibleRegisterScreen() {
  const navigate = useNavigate()
  const { setSession } = useAuth()

  const [step, setStep] = useState<Step>('code')
  const [code, setCode] = useState('')
  const [mainPersonName, setMainPersonName] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [validating, setValidating] = useState(false)

  const [form, setForm] = useState<RegisterForm>({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleValidateCode(event: FormEvent) {
    event.preventDefault()
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

  async function handleSubmitRegister(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      const auth = await registerResponsible({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        code: code.trim(),
      })
      setSession(auth)
      navigate('/inicio')
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.sidebar} />
      <span className={styles.sidebarLabel}>{step === 'code' ? 'CÓDIGO' : 'NOVA CONTA'}</span>

      <div className={styles.content}>
        <span className={`${styles.corner} ${styles.cornerTR}`}>+</span>
        <span className={`${styles.corner} ${styles.cornerBR}`}>+</span>

        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/selecionar-perfil')}
        >
          ← VOLTAR
        </button>

        {step === 'code' ? (
          <>
            <div className={styles.hero}>
              <div className={styles.seal}>
                <SignalMark size={64} />
              </div>
              <h1 className={styles.heroTitle}>
                sou<br />responsável<br />por alguém.
              </h1>
            </div>

            <p className={styles.subtitle}>
              A pessoa que você acompanha gerou um código<br />
              no app dela. Use-o para se conectar.
            </p>

            <form className={styles.form} onSubmit={handleValidateCode} noValidate>
              <CoordinateField
                coordinate="A1"
                label="CÓDIGO"
                placeholder="Ex.: 7F3K9A"
                value={code}
                onChange={(v) => setCode(v.toUpperCase())}
              />
              {codeError && (
                <span style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: -12 }}>
                  {codeError}
                </span>
              )}
              <ArrowButton
                label={validating ? 'VERIFICANDO...' : 'USAR CÓDIGO'}
                variant="primary"
              />
            </form>

            <div className={styles.footerLinks}>termos / privacidade</div>
          </>
        ) : (
          <>
            <div className={styles.hero}>
              <div className={styles.seal}>
                <SignalMark size={64} />
              </div>
              <h1 className={styles.heroTitle}>
                vamos<br />te conhecer<br />melhor.
              </h1>
            </div>

            <p className={styles.subtitle}>
              Só o necessário para começar.<br />
              Você vai se conectar com <strong>{mainPersonName}</strong>.
            </p>

            <form className={styles.form} onSubmit={handleSubmitRegister} noValidate>
              <CoordinateField
                coordinate="A1"
                label="NOME"
                placeholder="como prefere ser chamado(a)?"
                value={form.name}
                onChange={(v) => update('name', v)}
              />
              <CoordinateField
                coordinate="B2"
                label="E-MAIL"
                placeholder="voce@exemplo.com"
                type="email"
                value={form.email}
                onChange={(v) => update('email', v)}
              />
              <CoordinateField
                coordinate="C3"
                label="SENHA"
                placeholder="mínimo de 8 caracteres"
                type="password"
                value={form.password}
                onChange={(v) => update('password', v)}
              />
              <ArrowButton
                label={submitting ? 'CRIANDO...' : 'CRIAR CONTA'}
                variant="primary"
              />
            </form>

            <div className={styles.footerLinks}>termos / privacidade</div>
            <ErrorToast message={formError} onOpenChange={(open) => !open && setFormError(null)} />
          </>
        )}
      </div>
    </div>
  )
}
