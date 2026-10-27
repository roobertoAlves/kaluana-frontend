import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { newId, readJson, writeJson } from '../services/storage'
import { cancelSessionAlerts, scheduleSessionAlerts } from '../services/notifications'
import { addMinute, cancelTimer, pauseTimer, reevaluateTimer, resumeTimer, startTimer } from '../features/timer/timerSession'
import type { TimerSession } from '../features/timer/timerSession'

interface StartOptions {
  task: string
  minutes: number
  steps: string[]
  water: boolean
}

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
}

const Ctx = createContext<TimerContextValue | null>(null)

/** Guarda a sessão do temporizador (única, persistida) para Home, mini-player e telas T1 a T3. */
export function TimerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? 'anon'
  const [session, setSession] = useState<TimerSession | null>(null)
  const [now, setNow] = useState(Date.now())
  const ref = useRef<TimerSession | null>(null)

  const commit = useCallback(
    (next: TimerSession | null) => {
      ref.current = next
      setSession(next)
      void writeJson(userId, 'timer-session', next)
    },
    [userId],
  )

  // Carrega a sessão guardada e reavalia (cobre fechar e reabrir o app).
  useEffect(() => {
    let alive = true
    readJson<TimerSession | null>(userId, 'timer-session', null).then((s) => {
      if (!alive) return
      ref.current = s ? reevaluateTimer(s, Date.now()) : null
      setSession(ref.current)
    })
    return () => {
      alive = false
    }
  }, [userId])

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
        const s = startTimer(newId(), o.task, o.minutes, o.steps, o.water, Date.now())
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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, now, commit],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useTimer(): TimerContextValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTimer fora do TimerProvider')
  return v
}
