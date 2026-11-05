import { Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Icon } from '../../components/ui/Icons'
import { snoozeReminder } from '../../services/notifications'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'ReminderAlert'>

export function ReminderAlertScreen({ navigation, route }: Props) {
  const { title } = route.params
  const isWater = title.toLowerCase().includes('água')
  const done = () => navigation.navigate('Home')

  return (
    <Screen label="KALUANA · LEMBRETE" title={title} onBack={done}>
      <View style={{ alignItems: 'center', marginVertical: spacing[5] }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.emberBright, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={isWater ? 'drop' : 'bell'} size={44} color={colors.white} />
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 16, color: colors.textSecondary, marginTop: spacing[4], textAlign: 'center' }}>
          {isWater ? 'Um copo de água agora?' : 'É hora disso.'}
        </Text>
      </View>
      <ArrowButton label="Feito" onPress={done} />
      <View style={{ height: spacing[3] }} />
      <ArrowButton
        label="Adiar 10 min"
        variant="secondary"
        onPress={async () => {
          await snoozeReminder(title, 10).catch(() => {})
          done()
        }}
      />
    </Screen>
  )
}
