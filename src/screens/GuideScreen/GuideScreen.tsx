import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { SmallButton, formStyles } from '../../components/ui/forms'
import { useAuth } from '../../context/AuthContext'
import { useStoredObject } from '../../hooks/useStoredObject'
import { newId, readJson, writeJson } from '../../services/storage'
import { GUIDE_DEFINITION as def } from '../../features/guide/guideDefinition'
import { abandon, choose, interrupt, reevaluate, remainingSeconds, resume, startSession } from '../../features/guide/guideMachine'
import type { GuideSession } from '../../features/guide/guideMachine'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Guide'>

export interface GuideSessionLog {
  id: string
  status: GuideSession['status']
  startedAt: number
  finishedAt: number
}

/**
 * RF5: a tela só renderiza o estado da máquina (guideMachine) e repassa os
 * toques. Persistência a cada transição; o prazo é absoluto, então fechar o
 * app não perde a etapa (reavaliada ao reabrir).
 */
export function GuideScreen({ navigation }: Props) {
  const { user } = useAuth()
  const userId = user?.id ?? 'anon'
  const { value: session, update, loaded } = useStoredObject<GuideSession | null>('guide-session', null)
  const [now, setNow] = useState(Date.now())
  const sessionRef = useRef(session)
  sessionRef.current = session

  const logIfFinished = useCallback(
    async (s: GuideSession) => {
      if ((s.status === 'COMPLETED' || s.status === 'ABANDONED') && s.finishedAt) {
        const log = await readJson<GuideSessionLog[]>(userId, 'guide-log', [])
        await writeJson(userId, 'guide-log', [{ id: newId(), status: s.status, startedAt: s.startedAt, finishedAt: s.finishedAt }, ...log].slice(0, 200))
      }
    },
    [userId],
  )

  const apply = useCallback(
    async (next: GuideSession | null) => {
      await update(next)
      if (next) await logIfFinished(next)
    },
    [update, logIfFinished],
  )

  const tick = useCallback(() => {
    const t = Date.now()
    setNow(t)
    const cur = sessionRef.current
    if (cur && cur.status === 'ACTIVE') {
      const next = reevaluate(def, cur, t)
      if (next !== cur) void apply(next)
    }
  }, [apply])

  // Relógio de 1s enquanto a tela está aberta + reavaliação ao voltar do segundo plano.
  useEffect(() => {
    if (!loaded) return
    tick()
    const id = setInterval(tick, 1000)
    const sub = AppState.addEventListener('change', (st) => st === 'active' && tick())
    return () => {
      clearInterval(id)
      sub.remove()
    }
  }, [loaded, tick])

  if (!loaded) return <Screen label="KALUANA · GUIA" title="Guia" onBack={() => navigation.goBack()}>{null}</Screen>

  const state = session ? def.states[session.current] : null
  const secs = session ? remainingSeconds(session, now) : null

  // Sem sessão em andamento (ou já encerrada): tela de início.
  if (!session || !state || session.status === 'COMPLETED' || session.status === 'ABANDONED') {
    return (
      <Screen label="KALUANA · GUIA" title="Guia de autorregulação" onBack={() => navigation.goBack()}>
        {session?.status === 'COMPLETED' && state && (
          <View style={s.box}>
            <Text style={s.boxTitle}>{state.title}</Text>
            <Text style={formStyles.muted}>{state.body}</Text>
          </View>
        )}
        <Text style={[formStyles.muted, { marginBottom: spacing[5] }]}>
          Passos curtos, com poucas opções, para quando estiver difícil começar ou parar. Você escolhe só entre alternativas prontas.
        </Text>
        <ArrowButton label="Começar" onPress={() => apply(startSession(def, Date.now()))} />
        <Footer />
      </Screen>
    )
  }

  if (session.status === 'INTERRUPTED') {
    return (
      <Screen label="KALUANA · GUIA" title="Guia pausado" onBack={() => navigation.goBack()}>
        <Text style={[formStyles.muted, { marginBottom: spacing[5] }]}>Você parou em “{state.title}”. Quer continuar de onde parou?</Text>
        <ArrowButton label="Continuar" onPress={() => apply(resume(def, session, Date.now()))} />
        <View style={{ height: spacing[3] }} />
        <ArrowButton label="Encerrar" variant="secondary" onPress={() => apply(abandon(session, Date.now()))} />
        <Footer />
      </Screen>
    )
  }

  function pick(optionId: string) {
    const res = choose(def, session as GuideSession, optionId, Date.now())
    void apply(res.session)
    if (res.action === 'OPEN_CONTACTS') navigation.navigate('Contacts')
  }

  return (
    <Screen label="KALUANA · GUIA" title={state.title} onBack={() => navigation.goBack()}>
      <Text style={[s.body, { marginBottom: spacing[5] }]}>{state.body}</Text>

      {secs !== null && (
        <View style={s.timer} accessible accessibilityRole="timer" accessibilityLabel={`${secs} segundos restantes`}>
          <Text style={s.timerText}>{String(Math.floor(secs / 60)).padStart(2, '0')}:{String(secs % 60).padStart(2, '0')}</Text>
        </View>
      )}

      <View style={{ gap: spacing[3] }}>
        {(state.options ?? []).map((o) => (
          <Pressable key={o.id} onPress={() => pick(o.id)} accessibilityRole="button" style={({ pressed }) => [s.option, pressed && { backgroundColor: colors.cream }]}>
            <Text style={s.optionText}>{o.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[formStyles.row, { marginTop: spacing[6] }]}>
        <SmallButton label="Pausar" onPress={() => apply(interrupt(session, Date.now()))} />
        <SmallButton label="Encerrar" danger onPress={() => apply(abandon(session, Date.now()))} />
      </View>
      <Footer />
    </Screen>
  )
}

function Footer() {
  return (
    <Text style={[formStyles.muted, { marginTop: spacing[6], fontSize: 12 }]}>
      Este guia é um apoio e não substitui atendimento profissional. Em situação de risco, ligue 188 (CVV) ou 192 (SAMU).
    </Text>
  )
}

const s = StyleSheet.create({
  body: { fontFamily: fonts.body, fontSize: 18, lineHeight: 26, color: colors.textSecondary },
  option: { minHeight: 60, justifyContent: 'center', paddingHorizontal: spacing[4], borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.sm, backgroundColor: colors.bgSurface },
  optionText: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink },
  timer: { alignSelf: 'flex-start', marginBottom: spacing[5], paddingVertical: spacing[2], paddingHorizontal: spacing[4], backgroundColor: colors.ink, borderRadius: radius.sm },
  timerText: { fontFamily: fonts.display, fontSize: 36, letterSpacing: 2, color: colors.white },
  box: { borderLeftWidth: 2, borderLeftColor: colors.sage, backgroundColor: colors.bgSurface, padding: spacing[4], marginBottom: spacing[5] },
  boxTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.ink, marginBottom: spacing[1] },
})
