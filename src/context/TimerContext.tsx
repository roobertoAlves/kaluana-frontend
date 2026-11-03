import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { newId, readJson, writeJson } from '../services/storage'
import { registerTimerSession } from '../services/timerApi'
import { cancelSessionAlerts, scheduleSessionAlerts } from '../services/notifications'
import { addMinute, cancelTimer, pauseTimer, reevaluateTimer, resumeTimer, setMuted, soundPlaying, startTimer } from '../features/timer/timerSession'
import { useAmbientSound } from '../hooks/useAmbientSound'
import type { StartOptions, TimerSession } from '../features/timer/timerSession'

/** Sessões salvas por versões anteriores do app não tinham som, tarefa nem "silenciado". */
const normalize = (s: TimerSession | null): TimerSession | null =>
  s ? { ...s, sound: s.sound ?? 'NONE', taskId: s.taskId ?? null, muted: s.muted ?? false } : null

interface TimerContextValue {
  session: TimerSession | null
  /** Horário atual (atualiza a cada segundo enquanto há sessão rodando). */
  now: number
  start: (o: StartOptions) => void
  pause: () => void
  resume: () => void
  plusMinute: () => void
  cancel: () => void
  clear: () => void
  /** Liga/silencia o som ambiente da sessão (o estado fica salvo na sessão). */
  toggleMute: () => void
}

const Ctx = createContext<TimerContextValue | null>(null)

/** Guarda a sessão do temporizador (única, persistida) para Home, mini-player e telas T1 a T3. */
export function TimerProvider({ children }: { children: ReactNode }) {
  const { user, accessToken } = useAuth()
  const userId = user?.id ?? 'anon'
  const [session, setSession] = useState<TimerSession | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const ref = useRef<TimerSession | null>(null)
  // RF9: o som segue a sessão, em qualquer tela: toca rodando, para ao pausar,
  // silenciar ou encerrar. Fica aqui (e não na tela) para nunca ficar "preso".
  useAmbientSound(session?.sound ?? 'NONE', soundPlaying(session))

  const commit = useCallback(
    (next: TimerSession | null) => {
      const prev = ref.current
      ref.current = next
      setSession(next)
      void writeJson(userId, 'timer-session', next)
      // Registra no servidor só na transição para DONE/CANCELED (uma vez por sessão).
      if (accessToken && next && next.status !== prev?.status && (next.status === 'DONE' || next.status === 'CANCELED')) {
        void registerTimerSession(accessToken, next).catch(() => {})
      }
    },
    [userId, accessToken],
  )

  // Carrega a sessão guardada e reavalia (cobre fechar e reabrir o app).
  useEffect(() => {
    let alive = true
    readJson<TimerSession | null>(userId, 'timer-session', null).then((stored) => {
      const s = normalize(stored)
      if (!alive) return
      ref.current = s
      const evaluated = s ? reevaluateTimer(s, Date.now()) : null
      // Se o prazo venceu com o app fechado, passa pelo commit para registrar o fim.
      if (evaluated !== s) commit(evaluated)
      else setSession(s)
    })
    return () => {
      alive = false
    }
  }, [userId, commit])

  const running = session?.status === 'RUNNING'
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      const cur = ref.current
      if (cur) {
        const next = reevaluateTimer(cur, t)
        if (next !== cur) commit(next)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [running, commit])

  const alerts = (s: TimerSession) => {
    if (s.status === 'RUNNING' && s.endsAt) void scheduleSessionAlerts(s.task, s.endsAt, s.water).catch(() => {})
    else void cancelSessionAlerts().catch(() => {})
  }

  const value = useMemo<TimerContextValue>(
    () => ({
      session,
      now,
      start: (o) => {
        const s = startTimer(newId(), o, Date.now())
        setNow(Date.now())
        commit(s)
        alerts(s)
      },
      pause: () => ref.current && (commit(pauseTimer(ref.current, Date.now())), alerts(pauseTimer(ref.current, Date.now()))),
      resume: () => {
        if (!ref.current) return
        const s = resumeTimer(ref.current, Date.now())
        setNow(Date.now())
        commit(s)
        alerts(s)
      },
      plusMinute: () => {
        if (!ref.current) return
        const s = addMinute(ref.current, Date.now())
        commit(s)
        alerts(s)
      },
      cancel: () => {
        if (!ref.current) return
        commit(cancelTimer(ref.current, Date.now()))
        void cancelSessionAlerts().catch(() => {})
      },
      clear: () => {
        commit(null)
        void cancelSessionAlerts().catch(() => {})
      },
      toggleMute: () => {
        if (ref.current) commit(setMuted(ref.current, !ref.current.muted))
      },
    }),
    [session, now, commit],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTimer(): TimerContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTimer fora do TimerProvider')
  return v
}
