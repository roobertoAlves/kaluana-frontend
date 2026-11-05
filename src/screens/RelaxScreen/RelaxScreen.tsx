import { useEffect, useState } from 'react'
import { Animated, Easing, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { useReducedMotion } from '../../components/motion/useReducedMotion'
import { useAmbientSound } from '../../hooks/useAmbientSound'
import { useAmbientSession } from '../../hooks/useAmbientSession'
import { EXHALE_MS, INHALE_MS, breath, remainingLabel, soundLabel } from '../../features/sounds/soundscape'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Relax'>

const SIZE = 240

/** RF16 · Relaxar: respiração guiada com uma paisagem sonora por alguns minutos. */
export function RelaxScreen({ navigation, route }: Props) {
  const { sound, minutes } = route.params
  const session = useAmbientSession('RELAX', sound, minutes)
  const playing = !session.finished
  useAmbientSound(sound, playing)

  const reduced = useReducedMotion()
  const [scale] = useState(() => new Animated.Value(0.7))
  useEffect(() => {
    if (reduced || !playing) return undefined
    // O círculo cresce ao inspirar e diminui ao soltar o ar, no mesmo ritmo do texto.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1, duration: INHALE_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.7, duration: EXHALE_MS, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [reduced, playing, scale])

  const b = breath(session.elapsedMs)

  return (
    <Screen label="KALUANA · RELAXAR" title="Respire comigo" onBack={() => navigation.goBack()}>
      <View style={styles.center}>
        {session.finished ? (
          <Text style={styles.done} accessibilityRole="alert">
            {session.finished === 'DONE' ? 'Pronto. Volte devagar para o que estava fazendo.' : 'Sessão encerrada.'}
          </Text>
        ) : (
          <>
            <View style={styles.circleBox} accessible accessibilityLabel={`${b.phase === 'in' ? 'Inspire' : 'Solte o ar'}, ${b.secondsLeft} segundos`}>
              <Animated.View style={[styles.ring, { transform: [{ scale: reduced ? 1 : scale }] }]} />
              <View style={styles.label}>
                <Text style={styles.phase}>{b.phase === 'in' ? 'Inspire' : 'Solte o ar'}</Text>
                <Text style={styles.seconds}>{b.secondsLeft} s</Text>
              </View>
            </View>
            <Text style={styles.hint}>Inspire por 4 segundos e solte o ar por 6.</Text>
            <Text style={styles.time}>
              {soundLabel(sound)} · {remainingLabel(session.remainingMs)} restantes
            </Text>
          </>
        )}
      </View>
      {session.finished ? (
        <ArrowButton label="Voltar aos sons" onPress={() => navigation.goBack()} />
      ) : (
        <ArrowButton label="Encerrar" variant="secondary" onPress={session.stop} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: spacing[4], marginBottom: spacing[6] },
  circleBox: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: colors.sageBright },
  label: { alignItems: 'center' },
  phase: { fontFamily: fonts.display, fontSize: 24, color: colors.white },
  seconds: { fontFamily: fonts.body, fontSize: 15, color: colors.white },
  hint: { fontFamily: fonts.body, fontSize: 15, color: colors.ink, textAlign: 'center' },
  time: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  done: { fontFamily: fonts.body, fontSize: 17, color: colors.ink, textAlign: 'center', marginVertical: spacing[6] },
})
