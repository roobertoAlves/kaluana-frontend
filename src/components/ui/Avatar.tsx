import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Icon } from './Icons'
import { colors, fonts } from '../../styles/tokens'

interface Props {
  name: string
  color: string
  size?: number
  onEdit?: () => void
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

export function Avatar({ name, color, size = 96, onEdit }: Props) {
  const light = color === '#F2C94C'
  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
        <Text style={[styles.text, { fontSize: size * 0.36, color: light ? colors.ink : colors.white }]}>{initials(name)}</Text>
      </View>
      {onEdit && (
        <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel="Editar perfil" hitSlop={8} style={styles.edit}>
          <Icon name="pencil" size={16} color={colors.white} />
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: fonts.display },
  edit: { position: 'absolute', right: -2, bottom: -2, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.emberBright, borderWidth: 2, borderColor: colors.bgPage, alignItems: 'center', justifyContent: 'center' },
})
