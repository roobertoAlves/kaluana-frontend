import { useState } from 'react'
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { BottomMenu } from '../../components/ui/BottomMenu'
import { Icon } from '../../components/ui/Icons'
import type { IconName } from '../../components/ui/Icons'
import { useAuth } from '../../context/AuthContext'
import { generateCode, ApiError } from '../../services/api'
import { useStoredObject } from '../../hooks/useStoredObject'
import { DEFAULT_ACCESS } from '../../types/domain'
import type { AccessSettings } from '../../types/domain'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>

const APP_VERSION: string = require('../../../package.json').version

const ACCESS_ROWS: { key: keyof AccessSettings; label: string }[] = [
  { key: 'events', label: 'Eventos registrados' },
  { key: 'checkins', label: 'Check-ins' },
  { key: 'usage', label: 'Indicadores de uso' },
  { key: 'reports', label: 'Relatórios' },
]

interface RowDef {
  icon: IconName
  label: string
  value?: string
  onPress?: () => void
}

/** Configurações em grupos de linhas (ícone, valor à direita e seta). */
export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { clearSession, user, accessToken } = useAuth()
  const isPrimary = user?.role === 'PRIMARY'

  const { value: access, update: setAccess } = useStoredObject<AccessSettings>('access', DEFAULT_ACCESS)
  const [code, setCode] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerateCode() {
    if (!accessToken) return
    setError(null)
    setLoading(true)
    try {
      const result = await generateCode(accessToken)
      setCode(result.code)
      setExpiresAt(result.expiresAt)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Não foi possível gerar o código.')
    } finally {
      setLoading(false)
    }
  }

  const formatExpiry = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const account: RowDef[] = [
    { icon: 'user', label: 'Personalizar perfil', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'bell', label: 'Lembretes', onPress: () => navigation.navigate('Reminders') },
    { icon: 'people', label: 'Contatos de confiança', onPress: () => navigation.navigate('Contacts') },
    { icon: 'doc', label: 'Relatório', onPress: () => navigation.navigate('Report') },
  ]
  const prefs: RowDef[] = [
    { icon: 'globe', label: 'Idioma', value: 'Português' },
    { icon: 'palette', label: 'Tema', value: 'Claro', onPress: () => Alert.alert('Modo escuro em breve', 'O tema escuro está reservado para uma próxima versão.') },
    { icon: 'bell', label: 'Notificações do aparelho', onPress: () => void Linking.openSettings() },
  ]

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={[styles.content, { paddingTop: spacing[5] + insets.top }]}>
        <Text style={styles.label}>KALUANA · CONFIG.</Text>
        <Text accessibilityRole="header" style={styles.title}>Configurações</Text>

        <Text style={styles.section}>CONTA</Text>
        <Group rows={account} />

        <Text style={styles.section}>PREFERÊNCIAS</Text>
        <Group rows={prefs} />

        {isPrimary && (
          <>
            <Text style={styles.section}>EMPARELHAMENTO</Text>
            <View style={styles.box}>
              <Text style={styles.desc}>Gere um código para que um responsável ou profissional se conecte à sua conta.</Text>
              <Pressable
                style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
                onPress={handleGenerateCode}
                disabled={loading}
                accessibilityRole="button"
              >
                <Text style={styles.actionBtnText}>{loading ? 'GERANDO...' : 'GERAR CÓDIGO'}</Text>
                <Text style={styles.actionBtnArrow}>→</Text>
              </Pressable>
              {code && (
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>CÓDIGO DE SINCRONIZAÇÃO</Text>
                  <Text style={styles.codeValue}>{code}</Text>
                  {expiresAt && <Text style={styles.codeExpiry}>expira às {formatExpiry(expiresAt)}</Text>}
                </View>
              )}
              {error && <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>}
            </View>

            <Text style={styles.section}>QUEM PODE VER MEUS DADOS</Text>
            <View style={styles.box}>
              <Text style={styles.desc}>Tudo começa desligado. Você escolhe o que compartilhar e pode mudar quando quiser.</Text>
              {ACCESS_ROWS.map(({ key, label }) => (
                <View key={key} style={styles.accessRow}>
                  <Text style={styles.accessLabel}>{label}</Text>
                  <Switch value={access[key]} onValueChange={(v) => setAccess({ ...access, [key]: v })} accessibilityLabel={label} trackColor={{ true: colors.emberBright }} />
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.section}>SOBRE</Text>
        <Group rows={[{ icon: 'compass', label: 'Versão', value: APP_VERSION }]} />

        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          style={styles.logout}
          onPress={() => {
            clearSession()
            navigation.reset({ index: 0, routes: [{ name: 'ProfileSelection' }] })
          }}
        >
          <Text style={styles.logoutText}>{user ? 'Sair da conta' : 'Entrar'}</Text>
        </Pressable>
      </ScrollView>

      <BottomMenu
        active="configuracoes"
        onNavigate={(tab) => {
          if (tab === 'inicio') navigation.navigate('Home')
          if (tab === 'perfil') navigation.navigate('Profile')
        }}
      />
    </View>
  )
}

function Group({ rows }: { rows: RowDef[] }) {
  return (
    <View style={styles.group}>
      {rows.map((r, i) => (
        <Pressable
          key={r.label}
          disabled={!r.onPress}
          onPress={r.onPress}
          accessibilityRole={r.onPress ? 'button' : undefined}
          style={[styles.row, i < rows.length - 1 && styles.rowLine]}
        >
          <Icon name={r.icon} size={22} />
          <Text style={styles.rowLabel}>{r.label}</Text>
          {r.value && <Text style={styles.rowValue}>{r.value}</Text>}
          {r.onPress && <Icon name="chevron" size={18} color={colors.sand} />}
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  content: { padding: spacing[5], paddingBottom: spacing[6], width: '100%', maxWidth: 480, alignSelf: 'center' },
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.emberBright, marginBottom: spacing[2] },
  title: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: colors.ink, marginBottom: spacing[3] },
  section: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.ink, marginTop: spacing[5], marginBottom: spacing[3] },
  group: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 56, paddingHorizontal: spacing[4] },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.cream },
  rowLabel: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  rowValue: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  box: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[4] },
  desc: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginBottom: spacing[3] },
  actionBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.emberBright, paddingVertical: spacing[4], paddingHorizontal: spacing[4], minHeight: 52 },
  actionBtnPressed: { backgroundColor: colors.ember },
  actionBtnText: { fontFamily: fonts.display, fontSize: 13, letterSpacing: 1.2, color: colors.white },
  actionBtnArrow: { fontFamily: fonts.display, fontSize: 18, color: colors.white },
  codeBox: { marginTop: spacing[4], padding: spacing[4], backgroundColor: colors.bgMuted, alignItems: 'center' },
  codeLabel: { fontFamily: fonts.displayMedium, fontSize: 10, letterSpacing: 1.2, color: colors.textSecondary, marginBottom: spacing[2] },
  codeValue: { fontFamily: fonts.display, fontSize: 32, letterSpacing: 6, color: colors.ink },
  codeExpiry: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: spacing[2] },
  errorText: { fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: spacing[3] },
  accessRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 48 },
  accessLabel: { fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  logout: { alignSelf: 'center', minHeight: 48, justifyContent: 'center', marginTop: spacing[5] },
  logoutText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.danger, textDecorationLine: 'underline' },
})
