import { useCallback, useEffect, useState } from 'react'
import { AccessibilityInfo, AppState } from 'react-native'
import type { DayPlan, PlanChange, Task } from '../types/domain'
import { useAuth } from '../context/AuthContext'
import { useStoredObject } from './useStoredObject'
import { fetchSavedPlan, replanDay, saveDayPlan } from '../services/dayPlanApi'
import { ApiError, errorMessage } from '../services/http'
import { readJson, todayKey, writeJson } from '../services/storage'
import { nextSlot, planLocally } from '../features/plan/dayPlanner'
import { clock, needsReplan, replanLocally } from '../features/plan/replanner'

const CHECK_EVERY_MS = 60_000
const OFFLINE_NOTE = 'Sem conexão: plano montado no aparelho.'

interface PlanPrefs {
  /** RF14: reorganizar sozinho (padrão) ou só avisar e perguntar. */
  autoReplan: boolean
}

const isOffline = (e: unknown) => e instanceof ApiError && e.status === 0

/**
 * RF10/RF14: o plano salvo do dia. Ao abrir a tela, ao voltar para o app e a
 * cada minuto, confere se o plano ainda corresponde ao dia; se não, replaneja
 * (ou só avisa, se o usuário desligou a reorganização automática). Com conta,
 * a API monta e replaneja; sem conta ou sem rede, as mesmas regras rodam aqui.
 */
export function useDayPlan(tasks: { items: Task[]; loading: boolean }, energy: number | null) {
  const { user, accessToken } = useAuth()
  const userId = user?.id ?? 'anon'
  const today = todayKey()
  const cacheName = `day-plan:${today}`
  const prefs = useStoredObject<PlanPrefs>('day-plan-prefs', { autoReplan: true })

  const [plan, setPlan] = useState<DayPlan | null>(null)
  const [changes, setChanges] = useState<PlanChange[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Relógio da tela: muda a cada minuto e quando o app volta para o primeiro plano.
  const [minute, setMinute] = useState(clock)
  // Evita replanejar duas vezes no mesmo minuto (ex.: cache de tarefas ainda antigo).
  const [lastReplan, setLastReplan] = useState<string | null>(null)

  const keep = useCallback(
    async (next: DayPlan | null) => {
      setPlan(next)
      await writeJson(userId, cacheName, next)
    },
    [userId, cacheName],
  )

  useEffect(() => {
    let alive = true
    ;(async () => {
      const cached = await readJson<DayPlan | null>(userId, cacheName, null)
      if (!alive) return
      setPlan(cached)
      if (!accessToken) return
      try {
        const saved = await fetchSavedPlan(accessToken, today)
        if (alive) await keep(saved ?? cached)
      } catch {
        // Sem rede: fica o plano do cache.
      }
    })()
    return () => {
      alive = false
    }
  }, [userId, accessToken, today, cacheName, keep])

  async function build(end: string, assistant: boolean) {
    const start = nextSlot()
    if (start >= end) {
      setError(`Já passou de ${end}. Escolha um horário mais tarde.`)
      return
    }
    setError(null)
    setBusy(true)
    try {
      await keep(accessToken ? await saveDayPlan(accessToken, today, { start, end, assistant }) : planLocally(tasks.items, today, energy, start, end))
    } catch (e) {
      if (isOffline(e)) await keep({ ...planLocally(tasks.items, today, energy, start, end), note: OFFLINE_NOTE })
      else setError(errorMessage(e))
    } finally {
      setChanges([])
      setBusy(false)
    }
  }

  const replan = useCallback(async () => {
    if (!plan) return
    const now = clock()
    setLastReplan(now)
    setMinute(now)
    setBusy(true)
    let next: DayPlan
    try {
      next = accessToken ? await replanDay(accessToken, today, now) : replanLocally(plan, tasks.items, energy, now)
    } catch (e) {
      // Sem rede (ou plano só no aparelho): as mesmas regras rodam aqui.
      if (!isOffline(e) && !(e instanceof ApiError && e.status === 404)) {
        setError(errorMessage(e))
        setBusy(false)
        return
      }
      next = replanLocally(plan, tasks.items, energy, now)
    }
    await keep(next)
    setChanges(next.changes)
    setBusy(false)
    if (next.changes.length > 0) {
      AccessibilityInfo.announceForAccessibility(`Seu plano foi reorganizado: ${next.changes.length} ${next.changes.length === 1 ? 'mudança' : 'mudanças'}.`)
    }
  }, [plan, accessToken, today, tasks.items, energy, keep])

  const outdated =
    plan !== null && plan.date === today && !tasks.loading && prefs.loaded && lastReplan !== minute && needsReplan(plan, tasks.items, minute)
  const autoReplan = prefs.value.autoReplan

  // Reorganiza sozinho quando o plano fica desatualizado (fora do corpo do efeito, como um evento).
  useEffect(() => {
    if (!outdated || !autoReplan || busy) return
    const id = setTimeout(() => void replan(), 0)
    return () => clearTimeout(id)
  }, [outdated, autoReplan, busy, replan])

  useEffect(() => {
    const tick = () => setMinute(clock())
    const timer = setInterval(tick, CHECK_EVERY_MS)
    const sub = AppState.addEventListener('change', (state) => state === 'active' && tick())
    return () => {
      clearInterval(timer)
      sub.remove()
    }
  }, [])

  return {
    plan,
    changes,
    /** Desatualizado e com a reorganização automática desligada: só avisar. */
    stale: outdated && !autoReplan,
    /** Hora atual ("HH:MM"), atualizada a cada minuto. */
    now: minute,
    busy,
    error,
    clearError: () => setError(null),
    dismissChanges: () => setChanges([]),
    build,
    replan,
    autoReplan,
    setAutoReplan: (autoReplan: boolean) => {
      void prefs.update({ autoReplan })
    },
  }
}
