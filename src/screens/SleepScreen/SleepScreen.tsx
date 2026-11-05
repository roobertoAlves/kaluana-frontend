import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useKeepAwake } from 'expo-keep-awake'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Icon } from '../../components/ui/Icons'
import { useAmbientSound } from '../../hooks/useAmbientSound'
import { useAmbientSession } from '../../hooks/useAmbientSession'
import { remainingLabel, sleepVolume, soundLabel } from '../../features/sounds/soundscape'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Sleep'>

const clock = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

/**
 * RF16 · Dormir: tela escura, som que baixa aos poucos e para sozinho. A tela
 * fica ligada (e escura) para o volume e a parada não dependerem do sistema
 * deixar o app rodando em segundo plano.
 */
export function SleepScreen({ navigation, route }: Props) {
  useKeepAwake()
  const insets = useSafeAreaInsets()
  const { sound, minutes } = route.params
  const session = useAmbientSession('SLEEP', sound, minutes)
  const volume = sleepVolume(session.elapsedMs, session.totalMs)
  useAmbientSound(sound, !session.finished, volume)

  return (
    <View style={[styles.root, { paddingTop: spacing[5] + insets.top, paddingBottom: spacing[6] + insets.bottom }]}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Voltar" style={styles.back}>
        <Text style={styles.backText}>← VOLTAR</Text>
      </Pressable>
      <Text style={styles.label}>KALUANA · DORMIR</Text>
      <Text accessibilityRole="header" style={styles.title}>
        Boa noite
      </Text>

      <View style={styles.center}>
        <Icon name="moon" size={40} color={colors.sand} />
        <Text style={styles.clock} accessibilityLabel={`Agora são ${clock(new Date())}`}>
          {clock(new Date())}
        </Text>
        <Text style={styles.text}>
          {session.finished
            ? 'O som parou. Durma bem.'
            : `${soundLabel(sound)} · o volume baixa aos poucos e o som para daqui a ${remainingLabel(session.remainingMs)}.`}
        </Text>
        {!session.finished && <Text style={styles.small}>A tela fica ligada e escura até o som parar.</Text>}
      </View>

      {!session.finished && (
        <Pressable onPress={session.stop} accessibilityRole="button" style={styles.stop}>
          <Text style={styles.stopText}>PARAR AGORA</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.darkWedge, paddingHorizontal: spacing[5] },
  back: { alignSelf: 'flex-start', marginBottom: spacing[5], minHeight: 44, justifyContent: 'center' },
  backText: { fontFamily: fonts.display, fontSize: 11, letterSpacing: 0.9, color: colors.cream },
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.sand, marginBottom: spacing[2] },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, color: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing[3] },
  clock: { fontFamily: fonts.display, fontSize: 64, color: colors.cream },
  text: { fontFamily: fonts.body, fontSize: 15, color: colors.sand, textAlign: 'center' },
  small: { fontFamily: fonts.body, fontSize: 13, color: colors.sand, textAlign: 'center' },
  stop: { minHeight: 52, borderWidth: 1.5, borderColor: colors.cream, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stopText: { fontFamily: fonts.display, fontSize: 14, letterSpacing: 1, color: colors.cream },
})
