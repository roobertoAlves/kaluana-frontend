import type { ReactNode } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useIsFocused } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DotGrid } from './DotGrid'
import { SidebarWedge } from './SidebarWedge'
import { VerticalLabel } from './VerticalLabel'
import { CornerMarks } from './CornerMarks'
import { ErrorToast } from '../ErrorToast'
import { colors, maxWidthScreen } from '../../styles/tokens'

/** Margem do topo: o primeiro elemento ("← VOLTAR") começa logo abaixo da barra de status. */
const TOP_MARGIN = 28

interface SidebarScreenProps {
  /** Texto vertical no canto inferior esquerdo (ex.: "ACESSO"). */
  label: string
  /** Espaço do topo até o conteúdo (72 no cadastro, 100 nas demais). */
  paddingTop: number
  paddingBottom: number
  toastMessage?: string | null
  onDismissToast?: () => void
  children: ReactNode
}

/**
 * Casca das telas Login, Cadastro e Responsável: fundo pontilhado, faixa azul
 * inclinada, rótulo vertical e marcas "+" nos cantos direitos.
 */
export function SidebarScreen({
  label,
  paddingTop,
  paddingBottom,
  toastMessage = null,
  onDismissToast,
  children,
}: SidebarScreenProps) {
  const insets = useSafeAreaInsets()
  const isFocused = useIsFocused()

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      {/* O relógio da barra de status cai sobre a faixa azul. */}
      {isFocused && <StatusBar style="light" />}
      <ScrollView bounces={false} overScrollMode="never"
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.screen}>
          <DotGrid />
          <SidebarWedge />
          <VerticalLabel text={label} />
          <CornerMarks corners={['tr', 'br']} />
          <View
            style={[
              styles.content,
              { paddingTop: Math.min(paddingTop, TOP_MARGIN) + insets.top, paddingBottom: paddingBottom + insets.bottom },
            ]}
          >
            {children}
          </View>
        </View>
      </ScrollView>
      <ErrorToast message={toastMessage} onDismiss={onDismissToast ?? (() => {})} />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flexGrow: 1,
    width: '100%',
    maxWidth: maxWidthScreen,
    alignSelf: 'center',
    backgroundColor: colors.paper,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    zIndex: 2,
  },
})
