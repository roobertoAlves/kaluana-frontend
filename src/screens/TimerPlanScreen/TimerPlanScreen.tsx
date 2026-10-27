import { useState } from 'react'
import { Switch, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { ChipGroup, Field, SmallButton, formStyles } from '../../components/ui/forms'
import { useTimer } from '../../context/TimerContext'
import { ensureNotificationSetup } from '../../services/notifications'
import { colors, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'TimerPlan'>

const DURATIONS = [5, 10, 15, 25, 45].map((m) => ({ value: m, label: `${m} min` }))

/** T1 · planejar a sessão: tarefa, duração, etapas e lembrete de água. */
export function TimerPlanScreen({ navigation, route }: Props) {
  const preset = route.params?.preset
  const { session, start } = useTimer()
  const [task, setTask] = useState(preset?.task ?? '')
  const [minutes, setMinutes] = useState(preset?.minutes ?? 25)
  const [steps, setSteps] = useState<string[]>(preset?.steps ?? [])
  const [water, setWater] = useState(false)

  const busy = session?.status === 'RUNNING' || session?.status === 'PAUSED'

  async function go() {
    if (water) await ensureNotificationSetup().catch(() => false)
    start({ task, minutes, steps, water })
    navigation.replace('Timer')
  }

  return (
    <Screen label="KALUANA · TEMPORIZADOR" title="Planejar sessão" onBack={() => navigation.goBack()}>
      {busy && <Text style={[formStyles.muted, { marginBottom: spacing[4] }]}>Já existe uma sessão em andamento. Começar outra substitui a atual.</Text>}
      <Field label="TAREFA" value={task} onChangeText={setTask} placeholder="Ex.: estudar, arrumar a mesa" maxLength={60} />
      <ChipGroup label="DURAÇÃO" options={DURATIONS} value={minutes} onChange={setMinutes} />

      <Text style={[formStyles.sectionTitle, { marginTop: 0 }]}>ETAPAS (OPCIONAL, ATÉ 4)</Text>
      {steps.map((s, i) => (
        <Field
          key={i}
          label={`ETAPA ${i + 1}`}
          value={s}
          onChangeText={(t) => setSteps(steps.map((x, j) => (j === i ? t : x)))}
          maxLength={40}
        />
      ))}
      {steps.length < 4 && <SmallButton label="+ Adicionar etapa" onPress={() => setSteps([...steps, ''])} />}

      <View style={[formStyles.row, { marginVertical: spacing[4] }]}>
        <View style={{ flex: 1 }}>
          <Text style={formStyles.itemTitle}>Lembrar de beber água</Text>
          <Text style={formStyles.muted}>Um aviso a cada 20 min durante a sessão.</Text>
        </View>
        <Switch value={water} onValueChange={setWater} accessibilityLabel="Lembrar de beber água" trackColor={{ true: colors.emberBright }} />
      </View>

      <ArrowButton label="Começar" onPress={go} />
    </Screen>
  )
}
