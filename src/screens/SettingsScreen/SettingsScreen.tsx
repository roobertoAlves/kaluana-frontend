import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { BottomMenu } from '../../components/ui/BottomMenu'
import { useAuth } from '../../context/AuthContext'
import { generateCode, ApiError } from '../../services/api'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>

export function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { clearSession, user, accessToken } = useAuth()

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

  function formatExpiry(iso: string) {
    const d = new Date(iso)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: spacing[5] + insets.top }]}>
        <Text style={styles.label}>KALUANA · CONFIG.</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Configurações
        </Text>

        {user?.role === 'PRIMARY' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONTROLE</Text>
            <Text style={styles.sectionDesc}>
              Gere um código para que um responsável se conecte à sua conta.
            </Text>

            <Pressable
              style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
              onPress={handleGenerateCode}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.actionBtnText}>
                {loading ? 'GERANDO...' : 'GERAR CÓDIGO'}
              </Text>
              <Text style={styles.actionBtnArrow}>→</Text>
            </Pressable>

            {code && (
              <View style={styles.codeBox}>
                <Text style={styles.codeLabel}>CÓDIGO DE SINCRONIZAÇÃO</Text>
                <Text style={styles.codeValue}>{code}</Text>
                {expiresAt && (
                  <Text style={styles.codeExpiry}>expira às {formatExpiry(expiresAt)}</Text>
                )}
              </View>
            )}

            {error && (
              <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
            )}
          </View>
        )}

        <View style={styles.divider} />

        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => {
            clearSession()
            navigation.reset({ index: 0, routes: [{ name: 'ProfileSelection' }] })
          }}
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  content: {
    padding: spacing[5],
    paddingBottom: spacing[6],
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
    marginBottom: spacing[6],
  },
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.ink,
    marginBottom: spacing[2],
  },
  sectionDesc: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing[4],
  },
  actionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.ink,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[5],
    borderRadius: 2,
  },
  actionBtnPressed: {
    backgroundColor: colors.inkSoft,
  },
  actionBtnText: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 0.7,
    color: colors.white,
  },
  actionBtnArrow: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.white,
  },
  codeBox: {
    marginTop: spacing[4],
    borderWidth: 1,
    borderColor: colors.emberBright,
    padding: spacing[4],
    borderRadius: 2,
  },
  codeLabel: {
    fontFamily: fonts.displayMedium,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.emberBright,
    marginBottom: spacing[2],
  },
  codeValue: {
    fontFamily: fonts.display,
    fontSize: 32,
    letterSpacing: 6,
    color: colors.ink,
    marginBottom: spacing[1],
  },
  codeExpiry: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.danger,
    marginTop: spacing[3],
  },
  divider: {
    height: 1,
    backgroundColor: colors.cream,
    marginVertical: spacing[5],
  },
  logoutText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
})
