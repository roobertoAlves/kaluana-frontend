import { StyleSheet, Text, View } from 'react-native'
import type { PlanChange } from '../../types/domain'
import { FadeIn } from '../../components/motion/FadeIn'
import { Icon } from '../../components/ui/Icons'
import { SmallButton } from '../../components/ui/forms'
import { describeChange } from '../../features/plan/replanner'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

const MAX_LINES = 4

interface Props {
  changes: PlanChange[]
  /** Plano desatualizado com a reorganização automática desligada. */
  stale: boolean
  busy: boolean
  onDismiss: () => void
  onReplan: () => void
}

/** RF14: diz em poucas linhas o que mudou no plano (ou pergunta se pode reorganizar). */
export function ReplanNotice({ changes, stale, busy, onDismiss, onReplan }: Props) {
  if (changes.length === 0 && !stale) return null

  if (changes.length === 0) {
    return (
      <FadeIn style={styles.card}>
        <View style={styles.header}>
          <Icon name="calendar" size={20} color={colors.ink} />
          <Text style={styles.title} accessibilityRole="header">O dia mudou</Text>
        </View>
        <Text style={styles.line}>Seu plano ficou desatualizado. Quer reorganizar a partir de agora?</Text>
        <SmallButton label={busy ? 'Reorganizando...' : 'Reorganizar agora'} onPress={onReplan} />
      </FadeIn>
    )
  }

  const hidden = changes.length - MAX_LINES
  return (
    <FadeIn style={styles.card}>
      <View style={styles.header}>
        <Icon name="calendar" size={20} color={colors.ink} />
        <Text style={styles.title} accessibilityRole="header">Seu plano foi reorganizado</Text>
      </View>
      {changes.slice(0, MAX_LINES).map((c) => (
        <Text key={`${c.kind}-${c.taskId}`} style={styles.line}>
          • {describeChange(c)}
        </Text>
      ))}
      {hidden > 0 && <Text style={styles.more}>e mais {hidden} {hidden === 1 ? 'mudança' : 'mudanças'}</Text>}
      <SmallButton label="Entendi" onPress={onDismiss} />
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bgMuted, borderRadius: radius.lg, borderLeftWidth: 4, borderLeftColor: colors.sageBright, padding: spacing[4], marginBottom: spacing[4], gap: spacing[2] },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing[2] },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  line: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, lineHeight: 21 },
  more: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textSecondary },
})
