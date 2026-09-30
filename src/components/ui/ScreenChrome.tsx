import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SignalMark } from '../SignalMark'
import { colors, fonts, spacing } from '../../styles/tokens'

interface ScreenChromeProps {
  fieldNote: string
  contextTag: string
  step: string
  children: ReactNode
  /** "sinal recebido" e outras telas de retorno usam fundo escuro. */
  dark?: boolean
}

/**
 * Porte de src/components/ui/ScreenChrome.tsx: as marcas "+" de canto,
 * as duas linhas de cabeçalho (FIELD NOTE / tag de contexto, número do
 * passo / SIGNAL·ACTIVE) e o selo da raposa no canto superior direito.
 */
export function ScreenChrome({ fieldNote, contextTag, step, children, dark = false }: ScreenChromeProps) {
  const labelColor = dark ? colors.white : colors.ink
  const mutedColor = dark ? 'rgba(255,255,255,0.6)' : colors.textSecondary

  return (
    <SafeAreaView style={[styles.wrapper, dark && styles.wrapperDark]} edges={['top', 'bottom']}>
      <Corner style={styles.cornerTL} color={labelColor} />
      <Corner style={styles.cornerTR} color={labelColor} />
      <Corner style={styles.cornerBL} color={labelColor} />
      <Corner style={styles.cornerBR} color={labelColor} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.fieldNote, { color: labelColor }]}>{fieldNote}</Text>
          <Text style={styles.contextTag}>{contextTag}</Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.step}>{step}</Text>
          <Text style={[styles.signal, { color: mutedColor }]}>SIGNAL · ACTIVE</Text>
        </View>
      </View>

      <View style={styles.seal}>
        <SignalMark size={48} />
      </View>

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  )
}

function Corner({ style, color }: { style: object; color: string }) {
  return <Text style={[styles.cornerMark, style, { color }]}>+</Text>
}

const CORNER_INSET = spacing[3]

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  wrapperDark: {
    backgroundColor: colors.darkWedge,
  },
  cornerMark: {
    position: 'absolute',
    fontSize: 16,
    fontWeight: '700',
    zIndex: 10,
  },
  cornerTL: { top: CORNER_INSET, left: CORNER_INSET },
  cornerTR: { top: CORNER_INSET, right: CORNER_INSET },
  cornerBL: { bottom: CORNER_INSET, left: CORNER_INSET },
  cornerBR: { bottom: CORNER_INSET, right: CORNER_INSET },
  header: {
    paddingTop: spacing[6],
    paddingHorizontal: spacing[5],
    gap: spacing[1],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldNote: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    letterSpacing: 1.4,
  },
  contextTag: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.emberBright,
  },
  step: {
    fontFamily: fonts.display,
    fontWeight: '700',
    fontSize: 20,
    color: colors.emberBright,
  },
  signal: {
    fontFamily: fonts.displayMedium,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  seal: {
    position: 'absolute',
    top: spacing[5],
    right: spacing[5],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
})
