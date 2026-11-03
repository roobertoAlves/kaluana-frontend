import { useEffect } from 'react'
import { Alert, Image, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { SmallButton, formStyles } from '../../components/ui/forms'
import { useTimer } from '../../context/TimerContext'
import { soundInfo } from '../../features/timer/sounds'
import { STEP_COLORS, currentStep, formatClock, progress, remainingMs } from '../../features/timer/timerSession'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>

const SIZE = 260
const STROKE = 16
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

/** T2 · temporizador: anel de progresso com a raposa no centro. */
export function TimerScreen({ navigation }: Props) {
  // RF9: o som é tocado pelo TimerProvider; aqui só se liga/silencia.
  const { session, now, pause, resume, plusMinute, cancel, toggleMute } = useTimer()

  useEffect(() => {
    if (!session || session.status === 'CANCELED') navigation.replace('Home')
    else if (session.status === 'DONE') navigation.replace('TimerDone')
  }, [session, navigation])

  if (!session || session.status === 'DONE' || session.status === 'CANCELED') return null

  const p = progress(session, now)
  const left = remainingMs(session, now)
  const step = currentStep(session, now)
  const paused = session.status === 'PAUSED'

  function confirmCancel() {
    Alert.alert('Encerrar a sessão?', 'O tempo restante será descartado.', [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Encerrar', style: 'destructive', onPress: () => cancel() },
    ])
  }

  return (
    <Screen label="KALUANA · TEMPORIZADOR" title={session.task} onBack={() => navigation.navigate('Home')}>
      <View style={styles.ringWrap} accessible accessibilityRole="timer" accessibilityLabel={`${formatClock(left)} restantes${paused ? ', pausado' : ''}`}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute' }}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={colors.cream} strokeWidth={STROKE} fill="none" />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={colors.emberBright}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${C} ${C}`}
            strokeDashoffset={C * (1 - p)}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <Image source={require('../../../assets/images/logo.png')} style={styles.logo} accessibilityIgnoresInvertColors />
        <Text style={styles.time}>{formatClock(left)}</Text>
        {paused && <Text style={formStyles.muted}>pausado</Text>}
      </View>

      {session.steps.length > 0 && (
        <View style={styles.steps}>
          {session.steps.map((s, i) => {
            const color = STEP_COLORS[i % STEP_COLORS.length]
            const on = i === step
            return (
              <View key={i} style={[styles.step, { borderColor: color, backgroundColor: on ? color : colors.bgSurface }]}>
                <Text style={[styles.stepText, on && { color: colors.ink, fontFamily: fonts.bodyBold }]}>{s}</Text>
              </View>
            )
          })}
        </View>
      )}

      <View style={{ gap: spacing[3], marginTop: spacing[5] }}>
        <ArrowButton label={paused ? 'Retomar' : 'Pausar'} onPress={paused ? resume : pause} />
        <ArrowButton label="+1 min" variant="secondary" onPress={plusMinute} />
        <View style={{ alignItems: 'center' }}>
          {session.sound !== 'NONE' && (
            <SmallButton
              label={session.muted ? `Ligar o som (${soundInfo(session.sound).label})` : `Silenciar o som (${soundInfo(session.sound).label})`}
              onPress={toggleMute}
            />
          )}
          <SmallButton label="Encerrar sessão" danger onPress={confirmCancel} />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  ringWrap: { width: SIZE, height: SIZE, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginVertical: spacing[4] },
  logo: { width: 112, height: 112, borderRadius: 56 },
  time: { fontFamily: fonts.display, fontSize: 40, color: colors.ink },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], justifyContent: 'center', marginTop: spacing[3] },
  step: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing[3], borderWidth: 2, borderRadius: radius.lg },
  stepText: { fontFamily: fonts.body, fontSize: 14, color: colors.ink },
})
