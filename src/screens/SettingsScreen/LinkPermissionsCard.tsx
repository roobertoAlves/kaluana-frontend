import { useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import type { LinkedUser } from '../../types'
import type { LinkPermissions, LinkRelationship } from '../../types/domain'
import { ChipGroup } from '../../components/ui/forms'
import { RELATIONSHIP_LABEL } from '../../features/reports/buildReport'
import { updatePermissions } from '../../services/pairingApi'
import { errorMessage } from '../../services/http'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type PermissionKey = Exclude<keyof LinkPermissions, 'relationship'>

export const PERMISSION_ROWS: { key: PermissionKey; label: string; hint?: string }[] = [
  { key: 'events', label: 'Eventos registrados', hint: 'Com data, categoria e anotação.' },
  { key: 'checkins', label: 'Check-ins' },
  { key: 'usage', label: 'Indicadores de uso' },
  { key: 'tasks', label: 'Tarefas concluídas' },
  { key: 'reports', label: 'Relatórios e PDF', hint: 'Sem isto, a pessoa não vê nada do que está acima.' },
]

const RELATIONSHIPS = (Object.keys(RELATIONSHIP_LABEL) as LinkRelationship[]).map((value) => ({ value, label: RELATIONSHIP_LABEL[value] }))

const NOTHING: LinkPermissions = { relationship: 'OTHER', events: false, checkins: false, usage: false, tasks: false, reports: false }

interface Props {
  token: string
  link: LinkedUser
  onUnlink: () => void
}

export function LinkPermissionsCard({ token, link, onUnlink }: Props) {
  const [value, setValue] = useState<LinkPermissions>(link.permissions ?? NOTHING)
  const [error, setError] = useState<string | null>(null)

  async function save(next: LinkPermissions) {
    const previous = value
    setValue(next)
    setError(null)
    try {
      setValue(await updatePermissions(token, link.userId, next))
    } catch (e) {
      setValue(previous)
      setError(errorMessage(e, 'Não foi possível salvar agora.'))
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{link.name}</Text>
        <Pressable onPress={onUnlink} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.unlink}>Desfazer</Text>
        </Pressable>
      </View>
      <ChipGroup label="PERFIL" options={RELATIONSHIPS} value={value.relationship} onChange={(relationship) => void save({ ...value, relationship })} />
      <Text style={styles.label}>PODE VER</Text>
      {PERMISSION_ROWS.map(({ key, label, hint }) => (
        <View key={key} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{label}</Text>
            {hint && <Text style={styles.hint}>{hint}</Text>}
          </View>
          <Switch
            value={value[key]}
            onValueChange={(v) => void save({ ...value, [key]: v })}
            accessibilityLabel={`${link.name}: ${label}`}
            trackColor={{ true: colors.emberBright }}
          />
        </View>
      ))}
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  )
}

export function GrantedSummary({ link }: { link: LinkedUser }) {
  const p = link.permissions
  const granted = p ? PERMISSION_ROWS.filter((r) => p[r.key]).map((r) => r.label.toLowerCase()) : []
  return (
    <Text style={styles.hint}>
      {p ? `Seu perfil: ${RELATIONSHIP_LABEL[p.relationship].toLowerCase()}. ` : ''}
      {granted.length ? `Liberado para você: ${granted.join(', ')}.` : 'Nada liberado para você ainda.'}
    </Text>
  )
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.cream, borderRadius: radius.lg, padding: spacing[3], marginBottom: spacing[3] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44, marginBottom: spacing[2] },
  name: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink },
  unlink: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.danger, textDecorationLine: 'underline' },
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink, marginBottom: spacing[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 48 },
  rowLabel: { fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  hint: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: spacing[2] },
})
