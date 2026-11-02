import { useEffect, useState } from 'react'
import { Share, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { LinkedUser } from '../../types'
import { DEFAULT_ACCESS } from '../../types/domain'
import type { AccessSettings, CheckIn, LifeEvent } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Card, ChipGroup, formStyles } from '../../components/ui/forms'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { useStoredObject } from '../../hooks/useStoredObject'
import { REPORT_DISCLAIMER, applyAccess, formatReport, summarizeLocal } from '../../features/reports/buildReport'
import type { ReportSummary } from '../../features/reports/buildReport'
import { eventsSource } from '../../services/eventsApi'
import { checkInsSource } from '../../services/checkInsApi'
import { accessRemote } from '../../services/accessApi'
import { listLinks } from '../../services/pairingApi'
import { fetchLinkedReport, fetchOwnReport } from '../../services/reportsApi'
import { errorMessage } from '../../services/http'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>

const PERIODS = [{ value: 7, label: '7 dias' }, { value: 30, label: '30 dias' }, { value: 90, label: '90 dias' }]

/**
 * RF7: relatório informativo.
 * - Conta principal: "Para mim" traz tudo; "Para o profissional" mostra só o
 *   que foi liberado em Configurações (RF8). Os dados vêm da API.
 * - Responsável: relatório de quem está emparelhado, já filtrado no servidor (RNF3).
 * - Sem login: montado só com os registros deste aparelho.
 */
export function ReportScreen({ navigation }: Props) {
  const { user } = useAuth()
  return user?.role === 'RESPONSIBLE' ? <LinkedReport onBack={() => navigation.goBack()} /> : <OwnReport onBack={() => navigation.goBack()} />
}

function OwnReport({ onBack }: { onBack: () => void }) {
  const { user, accessToken } = useAuth()
  const { items: events } = useCollection<LifeEvent>(eventsSource)
  const { items: checkins } = useCollection<CheckIn>(checkInsSource)
  const { value: access } = useStoredObject<AccessSettings>('access', DEFAULT_ACCESS, user?.role === 'PRIMARY' ? accessRemote : undefined)
  const [days, setDays] = useState(7)
  const [mode, setMode] = useState<'own' | 'shared'>('own')
  const [remote, setRemote] = useState<ReportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    let alive = true
    fetchOwnReport(accessToken, days)
      .then((r) => {
        if (!alive) return
        setRemote(r)
        setError(null)
      })
      .catch((e) => {
        if (!alive) return
        setRemote(null)
        setError(errorMessage(e, 'Sem conexão. Mostrando os dados deste aparelho.'))
      })
    return () => {
      alive = false
    }
  }, [accessToken, days])

  const summary = remote ?? summarizeLocal({ userName: user?.name ?? '', days, events, checkins })
  const text = formatReport(mode === 'shared' ? applyAccess(summary, access) : summary)

  return (
    <Screen label="KALUANA · RELATÓRIO" title="Relatório" onBack={onBack} error={error}>
      <ChipGroup label="PERÍODO" options={PERIODS} value={days} onChange={setDays} />
      <ChipGroup
        label="PARA QUEM"
        options={[{ value: 'own', label: 'Para mim' }, { value: 'shared', label: 'Para o profissional' }]}
        value={mode}
        onChange={setMode}
      />
      {mode === 'shared' && <Text style={[formStyles.muted, { marginBottom: spacing[4] }]}>Inclui só o que você liberou em Configurações.</Text>}
      <ReportBody text={text} />
    </Screen>
  )
}

function LinkedReport({ onBack }: { onBack: () => void }) {
  const { accessToken } = useAuth()
  const [links, setLinks] = useState<LinkedUser[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [days, setDays] = useState(7)
  const [report, setReport] = useState<ReportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    listLinks(accessToken)
      .then((l) => {
        setLinks(l)
        setSelected((cur) => cur ?? l[0]?.userId ?? null)
      })
      .catch((e) => setError(errorMessage(e)))
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || !selected) return
    let alive = true
    fetchLinkedReport(accessToken, selected, days)
      .then((r) => {
        if (!alive) return
        setReport(r)
        setError(null)
      })
      .catch((e) => {
        if (alive) setError(errorMessage(e))
      })
    return () => {
      alive = false
    }
  }, [accessToken, selected, days])

  return (
    <Screen label="KALUANA · RELATÓRIO" title="Relatório" onBack={onBack} error={error}>
      {links && links.length === 0 && <Text style={formStyles.muted}>Nenhuma conta vinculada ainda.</Text>}
      {links && links.length > 1 && selected && (
        <ChipGroup label="DE QUEM" options={links.map((l) => ({ value: l.userId, label: l.name }))} value={selected} onChange={setSelected} />
      )}
      {selected && <ChipGroup label="PERÍODO" options={PERIODS} value={days} onChange={setDays} />}
      {report && (
        <>
          <Text style={[formStyles.muted, { marginBottom: spacing[4] }]}>Você vê só o que {report.userName} liberou.</Text>
          <ReportBody text={formatReport(report)} />
        </>
      )}
    </Screen>
  )
}

function ReportBody({ text }: { text: string }) {
  return (
    <>
      <Card>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.ink }}>{text}</Text>
      </Card>
      <View style={{ marginTop: spacing[2] }}>
        <ArrowButton label="Compartilhar" onPress={() => Share.share({ title: 'Relatório Kaluanã', message: text })} />
      </View>
      <Text style={[formStyles.muted, { marginTop: spacing[4], fontSize: 12 }]}>{REPORT_DISCLAIMER}</Text>
    </>
  )
}
