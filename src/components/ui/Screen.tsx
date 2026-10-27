import type { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts, maxWidthScreen, spacing } from '../../styles/tokens'

interface ScreenProps {
  label: string
  title: string
  onBack?: () => void
  children: ReactNode
}

/** Casca das telas internas: voltar, rótulo, título e rolagem com teclado. */
export function Screen({ label, title, onBack, children }: ScreenProps) {
  const insets = useSafeAreaInsets()
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView bounces={false} overScrollMode="never"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingTop: spacing[5] + insets.top, paddingBottom: spacing[6] + insets.bottom }]}
      >
        <View style={styles.content}>
          {onBack && (
            <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.back}>
              <Text style={styles.backText}>← VOLTAR</Text>
            </Pressable>
          )}
          <Text style={styles.label}>{label}</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgPage },
  scroll: { paddingHorizontal: spacing[5] },
  content: { width: '100%', maxWidth: maxWidthScreen, alignSelf: 'center' },
  back: { alignSelf: 'flex-start', marginBottom: spacing[5], minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: fonts.display, fontSize: 11, letterSpacing: 0.9, color: colors.ink },
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.emberBright, marginBottom: spacing[2] },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.ink, marginBottom: spacing[5] },
})
