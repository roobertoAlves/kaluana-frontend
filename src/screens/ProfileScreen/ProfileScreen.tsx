import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import type { Reminder } from '../../types/domain'
import { Avatar } from '../../components/ui/Avatar'
import { BottomMenu } from '../../components/ui/BottomMenu'
import { Icon } from '../../components/ui/Icons'
import type { IconName } from '../../components/ui/Icons'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { useProfile } from '../../hooks/useProfile'
import { remindersSource } from '../../services/remindersApi'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>

export function ProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { value: profile } = useProfile()
  const { items: reminders } = useCollection<Reminder>(remindersSource)

  const name = profile.displayName || user?.name || ''
  const active = reminders.filter((r) => r.enabled).length
  const isPrimary = user?.role === 'PRIMARY'

  const account: { icon: IconName; label: string; value?: string; go: () => void }[] = [
    { icon: 'user', label: 'Personalizar perfil', go: () => navigation.navigate('EditProfile') },
    ...(isPrimary ? [{ icon: 'shield' as IconName, label: 'Quem pode ver meus dados', go: () => navigation.navigate('Settings') }] : []),
    { icon: 'bell', label: 'Lembretes', value: `${active} ativo${active === 1 ? '' : 's'}`, go: () => navigation.navigate('Reminders') },
    { icon: 'people', label: 'Contatos de confiança', go: () => navigation.navigate('Contacts') },
    { icon: 'doc', label: 'Relatório', go: () => navigation.navigate('Report') },
  ]

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={[styles.scroll, { paddingTop: spacing[5] + insets.top }]}>
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.label}>KALUANA · PERFIL</Text>
            <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Configurações" style={styles.gear}>
              <Icon name="gear" color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Avatar name={name} color={profile.avatarColor} size={104} onEdit={() => navigation.navigate('EditProfile')} />
            <Text accessibilityRole="header" style={styles.name}>{name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{isPrimary ? 'USUÁRIO PRINCIPAL' : 'RESPONSÁVEL'}</Text>
            </View>
          </View>

          <View style={styles.group}>
            <InfoRow icon="mail" label="E-MAIL" value={user?.email ?? ''} />
            <InfoRow icon="user" label="COMO QUER SER CHAMADO(A)" value={profile.nickname || name.split(' ')[0]} />
            <InfoRow icon="globe" label="IDIOMA" value="Português" last />
          </View>

          {isPrimary && (
            <>
              <Text style={styles.section}>MINHAS FUNCIONALIDADES</Text>
              <View style={styles.minis}>
                {[
                  { icon: 'check' as IconName, label: 'Check-in' },
                  { icon: 'timer' as IconName, label: 'Tempo' },
                  { icon: 'note' as IconName, label: 'Eventos' },
                ].map((m) => (
                  <View key={m.label} style={styles.mini} accessible accessibilityLabel={`${m.label}, ligado`}>
                    <Icon name={m.icon} size={22} />
                    <Text style={styles.miniLabel}>{m.label}</Text>
                    <View style={styles.dot} />
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.section}>CONTA</Text>
          <View style={styles.group}>
            {account.map((a, i) => (
              <Pressable key={a.label} onPress={a.go} accessibilityRole="button" style={[styles.row, i < account.length - 1 && styles.rowLine]}>
                <Icon name={a.icon} size={22} />
                <Text style={styles.rowLabel}>{a.label}</Text>
                {a.value && <Text style={styles.rowValue}>{a.value}</Text>}
                <Icon name="chevron" size={18} color={colors.sand} />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomMenu
        active="perfil"
        onNavigate={(tab) => {
          if (tab === 'inicio') navigation.navigate('Home')
          if (tab === 'configuracoes') navigation.navigate('Settings')
        }}
      />
    </View>
  )
}

function InfoRow({ icon, label, value, last }: { icon: IconName; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowLine]} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={22} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  scroll: { padding: spacing[5], paddingBottom: spacing[6] },
  content: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.emberBright },
  gear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', marginVertical: spacing[4] },
  name: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginTop: spacing[3], marginBottom: spacing[2], textAlign: 'center' },
  badge: { borderWidth: 1, borderColor: colors.ink, paddingVertical: 4, paddingHorizontal: spacing[3] },
  badgeText: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink },
  group: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 56, paddingHorizontal: spacing[4], paddingVertical: spacing[2] },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.cream },
  rowLabel: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  rowValue: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  infoLabel: { fontFamily: fonts.displayMedium, fontSize: 10, letterSpacing: 1, color: colors.sand },
  infoValue: { fontFamily: fonts.body, fontSize: 16, color: colors.ink },
  section: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.ink, marginTop: spacing[5], marginBottom: spacing[3] },
  minis: { flexDirection: 'row', gap: spacing[3] },
  mini: { flex: 1, minHeight: 88, backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[3], justifyContent: 'space-between' },
  miniLabel: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.ink },
  dot: { position: 'absolute', top: spacing[3], right: spacing[3], width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sageBright },
})
