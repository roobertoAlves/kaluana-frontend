import type { ReactNode } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts, radius, spacing } from '../../../styles/tokens'

interface Props {
  visible: boolean
  title: string
  onCancel: () => void
  onConfirm: () => void
  confirmLabel?: string
  children: ReactNode
}

/** Folha inferior com Cancelar/Confirmar: base dos seletores de horário, data e duração. */
export function Sheet({ visible, title, onCancel, onConfirm, confirmLabel = 'Confirmar', children }: Props) {
  const insets = useSafeAreaInsets()
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Fechar" />
      <View style={[styles.sheet, { paddingBottom: spacing[5] + insets.bottom }]} accessibilityViewIsModal>
        <View style={styles.handle} />
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {children}
        <View style={styles.actions}>
          <Pressable onPress={onCancel} accessibilityRole="button" style={[styles.button, styles.secondary]}>
            <Text style={styles.secondaryText}>Cancelar</Text>
          </Pressable>
          <Pressable onPress={onConfirm} accessibilityRole="button" style={[styles.button, styles.primary]}>
            <Text style={styles.primaryText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(21, 40, 64, 0.45)' },
  sheet: { backgroundColor: colors.bgPage, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: spacing[5], paddingTop: spacing[2] },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.sand, marginBottom: spacing[3] },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, marginBottom: spacing[3], textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing[3], marginTop: spacing[4] },
  button: { flex: 1, minHeight: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: colors.ink },
  primaryText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.white },
  secondary: { borderWidth: 1.5, borderColor: colors.ink },
  secondaryText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
})
