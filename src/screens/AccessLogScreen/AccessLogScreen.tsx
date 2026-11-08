import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { formStyles } from '../../components/ui/forms'
import { Icon } from '../../components/ui/Icons'
import { useAuth } from '../../context/AuthContext'
import { fetchAccessLogs } from '../../services/accessApi'
import { errorMessage } from '../../services/http'
import type { AccessLogEntry } from '../../features/access/accessLog'
import { describeAccess, groupAccessByDay, timeOf } from '../../features/access/accessLog'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'AccessLog'>

export function AccessLogScreen({ navigation }: Props) {
  const { accessToken } = useAuth()
  const [entries, setEntries] = useState<AccessLogEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    let alive = true
    fetchAccessLogs(accessToken)
      .then((list) => alive && setEntries(list))
      .catch((e) => alive && setError(errorMessage(e)))
    return () => {
      alive = false
    }
  }, [accessToken])

  const groups = entries ? groupAccessByDay(entries) : []

  return (
    <Screen label="KALUANA · PRIVACIDADE" title="Quem viu meus dados" onBack={() => navigation.goBack()} error={error}>
      <Text style={[formStyles.muted, styles.intro]}>
        Cada vez que uma pessoa conectada abre ou exporta o seu relatório, fica registrado aqui. Para mudar o que cada pessoa pode ver, use Configurações ›
        Pessoas conectadas.
      </Text>

      {entries && entries.length === 0 && (
        <View style={styles.empty}>
          <Icon name="shield" size={28} />
          <Text style={formStyles.itemTitle}>Ninguém viu seus dados ainda</Text>
        </View>
      )}

      {groups.map((g) => (
        <View key={g.day}>
          <Text style={formStyles.sectionTitle}>{g.title.toUpperCase()}</Text>
          {g.entries.map((e, i) => (
            <View key={`${e.at}-${i}`} style={styles.row}>
              <Text style={styles.time}>{timeOf(e)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{e.viewerName || 'Pessoa sem vínculo'}</Text>
                <Text style={styles.what}>{describeAccess(e)}</Text>
              </View>
              <Icon name={e.action === 'EXPORT_PDF' ? 'doc' : 'shield'} size={20} color={colors.sand} />
            </View>
          ))}
        </View>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  intro: { marginBottom: spacing[3] },
  empty: {
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.sand,
    borderRadius: radius.lg,
    padding: spacing[5],
    marginTop: spacing[4],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    backgroundColor: colors.bgSurface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cream,
    padding: spacing[3],
    marginBottom: spacing[2],
  },
  time: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
    minWidth: 54,
  },
  name: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  what: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
})
