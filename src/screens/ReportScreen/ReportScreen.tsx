import { useEffect, useState } from 'react'
import { Pressable, Share, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { LinkedUser } from '../../types'
import type { CheckIn, LifeEvent } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Card, ChipGroup, formStyles } from '../../components/ui/forms'
import { useAuth } from '../../context/AuthContext'
import { useCollection } from '../../hooks/useCollection'
import { RELATIONSHIP_LABEL, REPORT_DISCLAIMER, applyAccess, formatReport, summarizeLocal } from '../../features/reports/buildReport'
import type { ReportSummary } from '../../features/reports/buildReport'
import { eventsSource } from '../../services/eventsApi'
import { checkInsSource } from '../../services/checkInsApi'
import { listLinks } from '../../services/pairingApi'
import { fetchLinkedReport, fetchOwnReport } from '../../services/reportsApi'
import { exportReportPdf } from '../../services/reportPdf'
import { errorMessage } from '../../services/http'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Report'>

const PERIODS = [{ value: 7, label: '7 dias' }, { value: 30, label: '30 dias' }, { value: 90, label: '90 dias' }]

/**
 * RF7: relatório informativo.
 * - Conta principal: "Para mim" traz tudo; escolhendo uma pessoa conectada,
 *   mostra a prévia exata do que ela vê (autorização por pessoa, RF8).
 * - Responsável/profissional: relatório de quem está emparelhado, já filtrado
 *   no servidor (RNF3), com exportação em PDF.
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
  const [days, setDays] = useState(7)
  const [viewer, setViewer] = useState('own')
  const [links, setLinks] = useState<LinkedUser[]>([])
  const [remote, setRemote] = useState<ReportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || user?.role !== 'PRIMARY') return
    listLinks(accessToken)
      .then(setLinks)
      .catch(() => {})
  }, [accessToken, user?.role])

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
  const person = links.find((l) => l.userId === viewer)
  const shown =
    person?.permissions && person.permissions.reports
      ? { ...applyAccess(summary, person.permissions, person.name), relationship: person.permissions.relationship }
      : person
        ? applyAccess(summary, { events: false, checkins: false, usage: false }, person.name)
        : summary

  return (
    <Screen label="KALUANA · RELATÓRIO" title="Relatório" onBack={onBack} error={error}>
      <ChipGroup label="PERÍODO" options={PERIODS} value={days} onChange={setDays} />
      {links.length > 0 && (
        <ChipGroup
          label="VER COMO"
          options={[{ value: 'own', label: 'Para mim' }, ...links.map((l) => ({ value: l.userId, label: l.name }))]}
          value={viewer}
          onChange={setViewer}
        />
      )}
      {person && (
        <Text style={[formStyles.muted, { marginBottom: spacing[4] }]}>
          {person.permissions?.reports
            ? `É isso que ${person.name} vê e pode exportar em PDF. Ajuste em Configurações › Pessoas conectadas.`
            : `${person.name} ainda não pode ver relatórios. Libere em Configurações › Pessoas conectadas.`}
        </Text>
      )}
      <ReportBody report={shown} />
    </Screen>
  )
}

function LinkedReport({ onBack }: { onBack: () => void }) {
  const { accessToken } = useAuth()
  const [links, setLinks] = useState<LinkedUser[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [days, setDays] = useState(30)
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
        if (!alive) return
        setReport(null)
        setError(errorMessage(e))
      })
    return () => {
      alive = false
    }
  }, [accessToken, selected, days])

  const person = links?.find((l) => l.userId === selected)

  return (
    <Screen label="KALUANA · RELATÓRIO" title="Relatório" onBack={onBack} error={error}>
      {links && links.length === 0 && <Text style={formStyles.muted}>Nenhuma conta vinculada ainda. Use o código de emparelhamento que a pessoa gerar.</Text>}
      {links && links.length > 1 && selected && (
        <ChipGroup label="DE QUEM" options={links.map((l) => ({ value: l.userId, label: l.name }))} value={selected} onChange={setSelected} />
      )}
      {selected && <ChipGroup label="PERÍODO" options={PERIODS} value={days} onChange={setDays} />}
      {person?.permissions && (
        <Text style={[formStyles.muted, { marginBottom: spacing[4] }]}>
          Seu perfil: {RELATIONSHIP_LABEL[person.permissions.relationship].toLowerCase()}. Você vê só o que {person.name} autorizou para você.
        </Text>
      )}
      {report && <ReportBody report={report} pdf />}
    </Screen>
  )
}

function ReportBody({ report, pdf }: { report: ReportSummary; pdf?: boolean }) {
  const text = formatReport(report)
  const [busy, setBusy] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  async function makePdf() {
    setBusy(true)
    setPdfError(null)
    try {
      await exportReportPdf(report)
    } catch {
      setPdfError('Não foi possível gerar o PDF neste aparelho. Tente compartilhar como texto.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Card>
        <Text style={styles.text}>{text}</Text>
      </Card>
      <View style={{ marginTop: spacing[2] }}>
        {pdf ? (
          <ArrowButton label="Gerar PDF" loading={busy} onPress={() => void makePdf()} />
        ) : (
          <ArrowButton label="Compartilhar" onPress={() => Share.share({ title: 'Relatório Kaluanã', message: text })} />
        )}
      </View>
      {pdf && (
        <Pressable onPress={() => Share.share({ title: 'Relatório Kaluanã', message: text })} accessibilityRole="button" style={styles.secondary}>
          <Text style={styles.secondaryText}>Compartilhar como texto</Text>
        </Pressable>
      )}
      {pdfError && (
        <Text style={styles.error} accessibilityRole="alert">
          {pdfError}
        </Text>
      )}
      <Text style={[formStyles.muted, { marginTop: spacing[4], fontSize: 12 }]}>{REPORT_DISCLAIMER}</Text>
    </>
  )
}

const styles = StyleSheet.create({
  text: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.ink },
  secondary: { alignSelf: 'center', minHeight: 44, justifyContent: 'center', marginTop: spacing[2] },
  secondaryText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, textDecorationLine: 'underline' },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: spacing[2] },
})
