import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { SoundArt } from '../../components/ui/SoundArt'
import { Icon } from '../../components/ui/Icons'
import { FadeIn } from '../../components/motion/FadeIn'
import { useTimer } from '../../context/TimerContext'
import { useAmbientSound } from '../../hooks/useAmbientSound'
import { SOUND_CATALOG, soundInfo } from '../../features/timer/sounds'
import type { TimerSound } from '../../features/timer/timerSession'
import { durationLabel } from '../../features/time/timeValues'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'TimerSound'>

/**
 * T1b · segunda etapa do planejamento: escolher o som num "player", com capa,
 * nome, descrição e prévia. O som só toca na prévia (botão) e durante a sessão.
 */
export function TimerSoundScreen({ navigation, route }: Props) {
  const { plan } = route.params
  const { start } = useTimer()
  const [sound, setSound] = useState<TimerSound>(plan.sound ?? 'BROWN')
  const [previewing, setPreviewing] = useState(false)
  const info = soundInfo(sound)
  useAmbientSound(sound, previewing)

  function choose(s: TimerSound) {
    setSound(s)
    // Trocar de som com a prévia ligada já toca o novo; "Sem som" desliga.
    if (s === 'NONE') setPreviewing(false)
  }

  function begin() {
    setPreviewing(false)
    start({ ...plan, sound })
    navigation.popToTop()
    navigation.navigate('Timer')
  }

  return (
    <Screen label="KALUANA · TEMPORIZADOR · 2 DE 2" title="Som da sessão" onBack={() => navigation.goBack()}>
      <FadeIn style={styles.player}>
        <SoundArt info={info} size={220} />
        <Text style={styles.name} accessibilityRole="header">
          {info.label}
        </Text>
        <Text style={styles.description}>{info.description}</Text>
        {sound !== 'NONE' && (
          <Pressable
            onPress={() => setPreviewing(!previewing)}
            accessibilityRole="button"
            accessibilityLabel={previewing ? `Parar a prévia de ${info.label}` : `Ouvir a prévia de ${info.label}`}
            style={({ pressed }) => [styles.play, pressed && { opacity: 0.85 }]}
          >
            <Icon name={previewing ? 'close' : 'sound'} size={22} color={colors.white} />
            <Text style={styles.playText}>{previewing ? 'Parar prévia' : 'Ouvir prévia'}</Text>
          </Pressable>
        )}
      </FadeIn>

      <Text style={styles.section}>ESCOLHA O SOM</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list} accessibilityRole="radiogroup">
        {SOUND_CATALOG.map((s) => {
          const on = s.value === sound
          return (
            <Pressable key={s.value} onPress={() => choose(s.value)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={s.label} style={[styles.card, on && styles.cardOn]}>
              <SoundArt info={s} size={88} />
              <Text style={[styles.cardText, on && styles.cardTextOn]} numberOfLines={2}>
                {s.label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {plan.task || 'Sessão'} · {durationLabel(plan.minutes)}
          {plan.steps.length > 0 ? ` · ${plan.steps.length} etapas` : ''}
        </Text>
        <Text style={styles.hint}>O som toca em loop durante a sessão e para ao pausar. Dá para silenciar a qualquer momento.</Text>
      </View>
      <ArrowButton label="Começar sessão" onPress={begin} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  player: { alignItems: 'center', gap: spacing[2], padding: spacing[4], borderRadius: radius.lg, backgroundColor: colors.bgSurface, borderWidth: 1, borderColor: colors.cream },
  name: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: spacing[2] },
  description: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: colors.textSecondary, textAlign: 'center' },
  play: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: 48, paddingHorizontal: spacing[5], borderRadius: 999, backgroundColor: colors.ink, marginTop: spacing[2] },
  playText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.white },
  section: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.4, color: colors.ink, marginTop: spacing[5], marginBottom: spacing[3] },
  list: { gap: spacing[3], paddingBottom: spacing[2] },
  card: { width: 112, alignItems: 'center', gap: spacing[2], padding: spacing[2], borderRadius: radius.lg, borderWidth: 2, borderColor: 'transparent' },
  cardOn: { borderColor: colors.ink, backgroundColor: colors.bgSurface },
  cardText: { fontFamily: fonts.body, fontSize: 13, color: colors.ink, textAlign: 'center' },
  cardTextOn: { fontFamily: fonts.bodyBold },
  summary: { marginVertical: spacing[4], gap: spacing[1] },
  summaryText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.ink },
  hint: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
})
