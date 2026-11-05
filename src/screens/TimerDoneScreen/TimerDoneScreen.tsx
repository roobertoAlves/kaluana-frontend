import { Text } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { formStyles } from '../../components/ui/forms'
import { useTimer } from '../../context/TimerContext'
import { spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'TimerDone'>

export function TimerDoneScreen({ navigation }: Props) {
  const { session, clear } = useTimer()
  const minutes = session ? Math.round(session.totalMs / 60_000) : 0

  return (
    <Screen label="KALUANA · TEMPORIZADOR" title="Sessão concluída" onBack={() => { clear(); navigation.navigate('Home') }}>
      <Text style={[formStyles.muted, { fontSize: 18, lineHeight: 26, marginBottom: spacing[6] }]}>
        {session ? `${minutes} min em “${session.task}”.` : 'Sessão finalizada.'} Pode seguir quando quiser.
      </Text>
      <ArrowButton label="Nova sessão" onPress={() => { clear(); navigation.replace('TimerPlan') }} />
      <Text style={{ height: spacing[3] }}> </Text>
      <ArrowButton label="Voltar ao início" variant="secondary" onPress={() => { clear(); navigation.navigate('Home') }} />
    </Screen>
  )
}
