import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Sheet } from '../../components/ui/pickers/Sheet'
import { normalizeApiUrl } from '../../features/api/apiAddress'
import { checkApi } from '../../services/http'
import { getApiBaseUrl, getApiBaseUrlOverride, getAutomaticApiBaseUrl, setApiBaseUrlOverride } from '../../services/runtimeConfig'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Status = { kind: 'idle' } | { kind: 'checking' } | { kind: 'ok' | 'fail'; url: string }

interface Props {
  visible: boolean
  onClose: () => void
}

export function ServerSheet({ visible, onClose }: Props) {
  const [value, setValue] = useState(getApiBaseUrlOverride() ?? '')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [error, setError] = useState<string | null>(null)
  const automatic = getAutomaticApiBaseUrl()

  async function test() {
    const url = value.trim() ? normalizeApiUrl(value) : getApiBaseUrl()
    if (!url) {
      setError('Digite um endereço como 192.168.0.10 ou http://192.168.0.10:8080.')
      return
    }
    setError(null)
    setStatus({ kind: 'checking' })
    setStatus({ kind: (await checkApi(url)) ? 'ok' : 'fail', url })
  }

  async function save() {
    if (value.trim() && !normalizeApiUrl(value)) {
      setError('Digite um endereço como 192.168.0.10 ou http://192.168.0.10:8080.')
      return
    }
    await setApiBaseUrlOverride(value.trim() ? normalizeApiUrl(value) : null)
    onClose()
  }

  async function resetToAutomatic() {
    setValue('')
    await setApiBaseUrlOverride(null)
    onClose()
  }

  return (
    <Sheet visible={visible} title="Servidor da API" confirmLabel="Salvar" onCancel={onClose} onConfirm={() => void save()} scroll>
      <Text style={styles.text}>
        Em uso agora: <Text style={styles.bold}>{getApiBaseUrl()}</Text>
      </Text>
      <Text style={styles.hint}>
        Deixe em branco para usar o automático ({automatic}): o mesmo computador que roda o Expo, na porta 8080. Preencha só se a API estiver em outra máquina.
      </Text>

      <TextInput
        value={value}
        onChangeText={(t) => {
          setValue(t)
          setError(null)
          setStatus({ kind: 'idle' })
        }}
        placeholder={automatic}
        placeholderTextColor={colors.sand}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        accessibilityLabel="Endereço da API"
        style={[styles.input, error && styles.inputError]}
      />
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <View style={styles.row}>
        <Pressable onPress={() => void test()} accessibilityRole="button" style={styles.button}>
          <Text style={styles.buttonText}>{status.kind === 'checking' ? 'Testando...' : 'Testar conexão'}</Text>
        </Pressable>
        <Pressable onPress={() => void resetToAutomatic()} accessibilityRole="button" style={styles.link}>
          <Text style={styles.linkText}>Usar automático</Text>
        </Pressable>
      </View>

      {(status.kind === 'ok' || status.kind === 'fail') && (
        <Text style={[styles.status, status.kind === 'ok' ? styles.ok : styles.fail]} accessibilityLiveRegion="polite">
          {status.kind === 'ok'
            ? `A API respondeu em ${status.url}.`
            : `Sem resposta de ${status.url}. Confira se a API está no ar, se o celular está na mesma rede e se a porta 8080 está liberada no firewall.`}
        </Text>
      )}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  text: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    marginBottom: spacing[2],
  },
  bold: { fontFamily: fonts.bodyBold },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: spacing[3],
  },
  input: {
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.bgSurface,
  },
  inputError: { borderColor: colors.danger },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.danger,
    marginTop: spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing[3],
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderRadius: radius.md,
    backgroundColor: colors.ink,
  },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.white },
  link: { minHeight: 44, justifyContent: 'center' },
  linkText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  status: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing[3],
  },
  ok: { color: colors.success },
  fail: { color: colors.danger },
})
