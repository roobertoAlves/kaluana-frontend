import { useState } from 'react'
import { Share, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { DEFAULT_ACCESS } from '../../types/domain'
import type { AccessSettings, CheckIn, LifeEvent } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Card, ChipGroup, formStyles } from '../../components/ui/forms'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { useStoredObject } from '../../hooks/useStoredObject'
import { REPORT_DISCLAIMER, buildReportText } from '../../features/reports/buildReport'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>

/**
 * RF7: relatório informativo. "Meu relatório" traz tudo; "Para o profissional"
 * traz só as seções que o usuário autorizou em Configurações (RF8).
 * O PDF oficial (JasperReports) vem do back-end; aqui o export é texto.
 */
export function ReportScreen({ navigation }: Props) {
  const { user } = useAuth()
  const { items: events } = useCollection<LifeEvent>('events')
  const { items: checkins } = useCollection<CheckIn>('checkins')
  const { value: access } = useStoredObject<AccessSettings>('access', DEFAULT_ACCESS)
  const [days, setDays] = useState(7)
  const [mode, setMode] = useState<'own' | 'shared'>('own')

  const text = buildReportText({
    userName: user?.name ?? '',
    days,
    events,
    checkins,
    access: mode === 'shared' ? access : undefined,
  })

  return (
    <Screen label="KALUANA · RELATÓRIO" title="Relatório" onBack={() => navigation.goBack()}>
      <ChipGroup
        label="PERÍODO"
        options={[{ value: 7, label: '7 dias' }, { value: 30, label: '30 dias' }, { value: 90, label: '90 dias' }]}
        value={days}
        onChange={setDays}
      />
      <ChipGroup
        label="PARA QUEM"
        options={[{ value: 'own', label: 'Para mim' }, { value: 'shared', label: 'Para o profissional' }]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'shared' && <Text style={[formStyles.muted, { marginBottom: spacing[4] }]}>Inclui só o que você liberou em Configurações.</Text>}

      <Card>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.ink }}>{text}</Text>
      </Card>

      <View style={{ marginTop: spacing[2] }}>
        <ArrowButton label="Compartilhar" onPress={() => Share.share({ title: 'Relatório Kaluanã', message: text })} />
      </View>
      <Text style={[formStyles.muted, { marginTop: spacing[4], fontSize: 12 }]}>{REPORT_DISCLAIMER}</Text>
    </Screen>
  )
}
