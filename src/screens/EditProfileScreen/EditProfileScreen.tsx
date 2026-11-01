import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Avatar } from '../../components/ui/Avatar'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Field, SmallButton, formStyles } from '../../components/ui/forms'
import { Icon } from '../../components/ui/Icons'
import type { IconName } from '../../components/ui/Icons'
import { useAuth } from '../../context/AuthContext'
import { AVATAR_COLORS, useProfile } from '../../hooks/useProfile'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>

/** 3.2 · editar perfil: avatar, nome, apelido e preferências. */
export function EditProfileScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { value: profile, update, loaded, error } = useProfile()
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [color, setColor] = useState<string>(AVATAR_COLORS[0])

  useEffect(() => {
    if (!loaded) return
    setName(profile.displayName || user?.name || '')
    setNickname(profile.nickname)
    setColor(profile.avatarColor)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  async function save() {
    const displayName = name.trim() || user?.name || ''
    if (await update({ ...profile, displayName, nickname: nickname.trim(), avatarColor: color })) navigation.goBack()
  }

  return (
    <Screen label="KALUANA · PERFIL" title="Editar perfil" onBack={() => navigation.goBack()} error={error}>
      <View style={{ alignItems: 'center', marginBottom: spacing[4] }}>
        <Avatar name={name || user?.name || ''} color={color} size={104} />
        <SmallButton label="ALTERAR FOTO (EM BREVE)" onPress={() => Alert.alert('Em breve', 'A troca de foto ainda não está disponível. Por enquanto, escolha uma cor.')} />
      </View>

      <Text style={styles.fieldLabel}>COR DO AVATAR</Text>
      <View style={styles.colors} accessibilityRole="radiogroup">
        {AVATAR_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            accessibilityRole="radio"
            accessibilityState={{ selected: c === color }}
            accessibilityLabel={`Cor ${c}`}
            style={[styles.swatch, { backgroundColor: c }, c === color && styles.swatchOn]}
          />
        ))}
      </View>

      <Field label="NOME" value={name} onChangeText={setName} autoCapitalize="words" maxLength={80} />
      <Field label="COMO QUER SER CHAMADO(A)" value={nickname} onChangeText={setNickname} maxLength={30} placeholder="Apelido" />

      <Text style={formStyles.sectionTitle}>PREFERÊNCIAS</Text>
      <View style={styles.group}>
        <Row icon="globe" label="Idioma" value="Português" />
        <Row icon="palette" label="Tema" value="Claro" last onPress={() => Alert.alert('Modo escuro em breve', 'O tema escuro está reservado para uma próxima versão.')} />
      </View>

      <View style={{ marginTop: spacing[5] }}>
        <ArrowButton label="Salvar alterações" onPress={save} />
      </View>
      <Text style={[formStyles.muted, { fontSize: 12, marginTop: spacing[3] }]}>{user ? 'As alterações ficam salvas na sua conta.' : 'As alterações ficam salvas neste aparelho.'}</Text>
    </Screen>
  )
}

function Row({ icon, label, value, last, onPress }: { icon: IconName; label: string; value: string; last?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} style={[styles.row, !last && styles.rowLine]}>
      <Icon name={icon} size={22} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
      <Icon name="chevron" size={18} color={colors.sand} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fieldLabel: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink, marginBottom: spacing[2] },
  colors: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[5] },
  swatch: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: colors.ink },
  group: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 56, paddingHorizontal: spacing[4] },
  rowLine: { borderBottomWidth: 1, borderBottomColor: colors.cream },
  rowLabel: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  rowValue: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
})
