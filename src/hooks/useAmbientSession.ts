import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { registerAmbientSession } from '../services/ambientApi'
import type { AmbientMode, Soundscape } from '../features/sounds/soundscape'

const TICK_MS = 1000

/**
 * RF16: relógio de uma sessão de Relaxar ou Dormir. O fim é um horário
 * absoluto (como no foco), então o tempo continua certo mesmo se a tela travar
 * por um instante. Ao terminar (ou ao sair da tela), registra a sessão uma vez.
 */
export function useAmbientSession(mode: AmbientMode, sound: Soundscape, minutes: number) {
  const { accessToken } = useAuth()
  const totalMs = minutes * 60_000
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(startedAt)
  const [finished, setFinished] = useState<'DONE' | 'CANCELED' | null>(null)
  const logged = useRef(false)

  const finish = useCallback(
    (status: 'DONE' | 'CANCELED') => {
      if (logged.current) return
      logged.current = true
      setFinished(status)
      if (accessToken) {
        void registerAmbientSession(accessToken, { mode, sound, plannedMinutes: minutes, status, startedAt, finishedAt: Date.now() }).catch(() => {})
      }
    },
    [accessToken, mode, sound, minutes, startedAt],
  )

  useEffect(() => {
    if (finished) return undefined
    const timer = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t - startedAt >= totalMs) finish('DONE')
    }, TICK_MS)
    return () => clearInterval(timer)
  }, [finished, startedAt, totalMs, finish])

  // Saiu da tela antes do fim: conta como encerrada antes.
  const latestFinish = useRef(finish)
  useEffect(() => {
    latestFinish.current = finish
  }, [finish])
  useEffect(() => () => latestFinish.current('CANCELED'), [])

  const elapsedMs = Math.min(now - startedAt, totalMs)
  return { elapsedMs, remainingMs: totalMs - elapsedMs, totalMs, finished, stop: () => finish('CANCELED') }
}
