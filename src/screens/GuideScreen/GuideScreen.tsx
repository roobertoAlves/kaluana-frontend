import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Card, SmallButton, formStyles } from '../../components/ui/forms'
import { useAuth } from '../../context/AuthContext'
import { useAssistantStatus } from '../../hooks/useAssistantStatus'
import { rankGuideOptions } from '../../services/assistantApi'
import { recordGuideSession } from '../../services/guideApi'
import {
  abandonGuide,
  chooseOption,
  currentStep,
  orderOptions,
  pauseGuide,
  resumeGuide,
  secondsLeft,
  startGuide,
  summarize,
  tickGuide,
} from '../../features/guide/guideMachine'
import type { GuideAction, GuideOption, GuideRun } from '../../features/guide/guideMachine'
import { OVERLOAD_GUIDE } from '../../features/guide/guides'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Guide'>

const GUIDE = OVERLOAD_GUIDE

const clock = () => Date.now()

const ACTION_ROUTE: Record<GuideAction, 'Sounds' | 'Contacts' | 'Tasks'> = {
  OPEN_RELAX: 'Sounds',
  OPEN_SOUNDS: 'Sounds',
  OPEN_CONTACTS: 'Contacts',
  OPEN_TASKS: 'Tasks',
}

export function GuideScreen({ navigation }: Props) {
  const { accessToken } = useAuth()
  const assistant = useAssistantStatus()
  const [run, setRun] = useState<GuideRun | null>(null)
  const [now, setNow] = useState(clock)
  const [order, setOrder] = useState<{
    stepId: string
    order: number[]
  } | null>(null)
  const saved = useRef(false)

  const step = run ? currentStep(GUIDE, run) : null
  const finished = run?.status === 'COMPLETED' || run?.status === 'ABANDONED'
  const options = useMemo(() => (step ? orderOptions(step, order?.stepId === step.id ? order.order : null) : []), [step, order])
  const left = run ? secondsLeft(GUIDE, run, now) : null

  const active = run?.status === 'IN_PROGRESS'
  const stepId = step?.id ?? null

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      const t = clock()
      setNow(t)
      setRun((r) => (r ? tickGuide(GUIDE, r, t) : r))
    }, 1000)
    return () => clearInterval(id)
  }, [active])

  useEffect(() => {
    const current = stepId ? GUIDE.steps[stepId] : null
    if (!current || current.final || !assistant.enabled || !accessToken) return
    let alive = true
    rankGuideOptions(
      accessToken,
      current.text,
      current.options.map((o) => o.label),
    )
      .then((r) => alive && setOrder({ stepId: current.id, order: r.order }))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [stepId, assistant.enabled, accessToken])

  useEffect(() => {
    if (!run || saved.current) return
    const summary = summarize(run)
    if (!summary || !accessToken) return
    saved.current = true
    recordGuideSession(accessToken, summary).catch(() => undefined)
  }, [run, accessToken])

  function begin() {
    const t = clock()
    saved.current = false
    setOrder(null)
    setNow(t)
    setRun(startGuide(GUIDE, t))
  }

  function choose(option: GuideOption) {
    if (!run) return
    const t = clock()
    setNow(t)
    setRun(chooseOption(GUIDE, run, option.id, t))
    if (option.action) navigation.navigate(ACTION_ROUTE[option.action])
  }

  const assistantOrdered = !!step && order?.stepId === step.id && options !== step.options

  return (
    <Screen label="KALUANA · GUIA" title={GUIDE.title} onBack={() => navigation.goBack()}>
      {!run && (
        <>
          <Text style={formStyles.muted}>{GUIDE.summary}</Text>
          <Text style={[formStyles.muted, styles.gap]}>
            Você pode pausar ou encerrar a qualquer momento. Nada do que você escolher aqui é enviado, só quando o guia terminou.
          </Text>
          <View style={styles.gap}>
            <ArrowButton label="Começar" onPress={begin} />
          </View>
        </>
      )}

      {run && step && (
        <Card>
          <Text accessibilityRole="header" style={styles.question}>
            {step.text}
          </Text>
          {run.status === 'INTERRUPTED' && <Text style={formStyles.muted}>Pausado. Continue quando quiser.</Text>}
          {left !== null && run.status === 'IN_PROGRESS' && (
            <Text style={formStyles.muted}>
              Sem resposta em {left} s, sigo com “{step.options.find((o) => o.id === step.defaultOption)?.label}”.
            </Text>
          )}
          {assistantOrdered && <Text style={styles.note}>Ordem sugerida pelo assistente</Text>}
        </Card>
      )}

      {run && step && !finished && (
        <View style={styles.options}>
          {options.map((o) => (
            <Pressable
              key={o.id}
              onPress={() => choose(o)}
              disabled={run.status !== 'IN_PROGRESS'}
              accessibilityRole="button"
              accessibilityState={{ disabled: run.status !== 'IN_PROGRESS' }}
              style={[styles.option, run.status !== 'IN_PROGRESS' && styles.optionOff]}
            >
              <Text style={styles.optionText}>{o.label}</Text>
            </Pressable>
          ))}
          <View style={formStyles.row}>
            {run.status === 'IN_PROGRESS' ? (
              <SmallButton label="Pausar" onPress={() => setRun(pauseGuide(run, clock()))} />
            ) : (
              <SmallButton label="Continuar" onPress={() => setRun(resumeGuide(run, clock()))} />
            )}
            <SmallButton label="Encerrar" danger onPress={() => setRun(abandonGuide(run, clock()))} />
          </View>
        </View>
      )}

      {run && finished && (
        <View style={styles.gap}>
          {run.status === 'ABANDONED' && <Text style={formStyles.muted}>Guia encerrado. Tudo bem parar aqui.</Text>}
          <ArrowButton label="Recomeçar" variant="secondary" onPress={begin} />
          <View style={styles.gap}>
            <ArrowButton label="Voltar ao início" onPress={() => navigation.goBack()} />
          </View>
        </View>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  gap: { marginTop: spacing[4] },
  question: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    lineHeight: 28,
    color: colors.ink,
    marginBottom: spacing[2],
  },
  note: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing[2],
  },
  options: { gap: spacing[3] },
  option: {
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    borderWidth: 1.5,
    borderColor: colors.ink,
    borderRadius: radius.md,
    backgroundColor: colors.bgSurface,
  },
  optionOff: { opacity: 0.5 },
  optionText: { fontFamily: fonts.body, fontSize: 17, color: colors.ink },
})
