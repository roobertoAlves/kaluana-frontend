import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { QuickKind, QuickParse } from '../../features/tasks/quickAdd'
import { FadeIn } from '../../components/motion/FadeIn'
import { Icon } from '../../components/ui/Icons'
import type { IconName } from '../../components/ui/Icons'
import { colors, fonts, spacing } from '../../styles/tokens'

const ICON: Record<QuickKind, IconName> = { date: 'calendar', minutes: 'timer', priority: 'list', steps: 'check' }

interface Props {
  parsed: QuickParse
  onUndo: (kind: QuickKind) => void
}

/** RF15: o que o app entendeu da frase. Tocar no × desfaz aquele item. */
export function QuickChips({ parsed, onUndo }: Props) {
  if (parsed.tokens.length === 0) return null
  return (
    <FadeIn style={styles.box}>
      <View style={styles.row} accessibilityLabel="O que foi entendido">
        {parsed.tokens.map((t) => (
          <View key={t.kind} style={styles.chip}>
            <Icon name={ICON[t.kind]} size={16} color={colors.ink} />
            <Text style={styles.label}>{t.label}</Text>
            <Pressable onPress={() => onUndo(t.kind)} hitSlop={12} accessibilityRole="button" accessibilityLabel={`Desfazer ${t.label}`}>
              <Icon name="close" size={14} color={colors.sand} />
            </Pressable>
          </View>
        ))}
      </View>
      <Text style={styles.hint}>
        Título: “{parsed.title}”. Toque no × para desfazer o que não estiver certo.
      </Text>
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  box: { marginTop: spacing[2], gap: spacing[2] },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, paddingLeft: 10, paddingRight: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.cream, backgroundColor: colors.bgMuted },
  label: { fontFamily: fonts.body, fontSize: 13, color: colors.ink },
  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
})
