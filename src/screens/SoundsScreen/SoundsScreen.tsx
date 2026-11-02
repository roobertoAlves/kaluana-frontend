import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { ChipGroup, formStyles } from '../../components/ui/forms'
import { FadeIn } from '../../components/motion/FadeIn'
import { PressableScale } from '../../components/motion/PressableScale'
import { Icon } from '../../components/ui/Icons'
import type { IconName } from '../../components/ui/Icons'
import { MODE_MINUTES, SOUNDS, suggestSound } from '../../features/sounds/soundscape'
import type { Soundscape } from '../../features/sounds/soundscape'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Sounds'>
type Mode = 'FOCUS' | 'RELAX' | 'SLEEP'

const MODES: { value: Mode; label: string }[] = [
  { value: 'FOCUS', label: 'Foco' },
  { value: 'RELAX', label: 'Relaxar' },
  { value: 'SLEEP', label: 'Dormir' },
]
const MINUTES: Record<Mode, number[]> = { FOCUS: [15, 25, 45], ...MODE_MINUTES }
const START_LABEL: Record<Mode, string> = { FOCUS: 'Planejar o foco', RELAX: 'Começar a relaxar', SLEEP: 'Começar a dormir' }
const HINT: Record<Mode, string> = {
  FOCUS: 'O som toca durante a sessão de foco e pausa junto com ela.',
  RELAX: 'Respiração guiada: 4 segundos inspirando, 6 soltando o ar.',
  SLEEP: 'O volume baixa aos poucos e o som para sozinho. A tela fica ligada e escura.',
}
const ICON: Record<Soundscape, IconName> = { RAIN: 'drop', WAVES: 'wave', FIRE: 'flame', FOREST: 'leaf', BROWN: 'sound', PINK: 'sound', WHITE: 'sound' }

/** RF16 (Endel): sons gerados no aparelho para focar, relaxar e dormir. */
export function SoundsScreen({ navigation }: Props) {
  const suggestion = suggestSound()
  const [mode, setMode] = useState<Mode>('RELAX')
  const [sound, setSound] = useState<Soundscape>(suggestion.sound)
  const [minutes, setMinutes] = useState(MINUTES.RELAX[1])

  function changeMode(next: Mode) {
    setMode(next)
    setMinutes(MINUTES[next][1])
  }

  function start() {
    if (mode === 'FOCUS') navigation.navigate('TimerPlan', { preset: { task: 'Foco', minutes, sound } })
    else navigation.navigate(mode === 'RELAX' ? 'Relax' : 'Sleep', { sound, minutes })
  }

  const suggested = SOUNDS.find((s) => s.value === suggestion.sound)

  return (
    <Screen label="KALUANA · SONS" title="Sons" onBack={() => navigation.goBack()}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {MODES.map((m) => {
          const on = m.value === mode
          return (
            <PressableScale
              key={m.value}
              onPress={() => changeMode(m.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              containerStyle={styles.tabBox}
              style={[styles.tab, on && styles.tabOn]}
            >
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{m.label}</Text>
            </PressableScale>
          )
        })}
      </View>
      <Text style={[formStyles.muted, styles.hint]}>
        {HINT[mode]} Sugestão para agora ({suggestion.period}): {suggested?.label}. Tudo é gerado no aparelho, sem internet.
      </Text>

      <Text style={formStyles.sectionTitle}>PAISAGENS SONORAS</Text>
      <View style={styles.grid}>
        {SOUNDS.map((s, i) => {
          const on = s.value === sound
          return (
            <FadeIn key={s.value} index={i} style={styles.tileBox}>
              <PressableScale
                onPress={() => setSound(s.value)}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${s.label}: ${s.description}`}
                style={[styles.tile, on && styles.tileOn]}
              >
                <Icon name={ICON[s.value]} size={22} color={on ? colors.white : colors.ink} />
                <Text style={[styles.tileTitle, on && styles.tileTextOn]}>{s.label}</Text>
                <Text style={[styles.tileText, on && styles.tileTextOn]}>{s.description}</Text>
              </PressableScale>
            </FadeIn>
          )
        })}
      </View>

      <ChipGroup label="QUANTO TEMPO" options={MINUTES[mode].map((m) => ({ value: m, label: `${m} min` }))} value={minutes} onChange={setMinutes} />
      <ArrowButton label={START_LABEL[mode]} onPress={start} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing[1], padding: spacing[1], borderRadius: radius.lg, backgroundColor: colors.bgMuted },
  tabBox: { flex: 1 },
  tab: { minHeight: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: colors.ink },
  tabText: { fontFamily: fonts.displayMedium, fontSize: 15, color: colors.ink },
  tabTextOn: { color: colors.white },
  hint: { marginTop: spacing[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[2] },
  tileBox: { width: '48%' },
  tile: { minHeight: 96, padding: spacing[3], gap: 4, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, backgroundColor: colors.bgSurface },
  tileOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  tileTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.ink },
  tileText: { fontFamily: fonts.body, fontSize: 12, color: colors.textSecondary },
  tileTextOn: { color: colors.white },
})
