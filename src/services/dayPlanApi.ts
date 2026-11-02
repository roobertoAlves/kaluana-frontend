import type { DayPlan } from '../types/domain'
import { ApiError, apiRequest } from './http'

/*
 * RF10/RF11/RF14 · /api/day-plan. Data e horários vão do aparelho porque o
 * servidor não sabe o fuso do usuário. O plano fica salvo por dia.
 */

/** Plano salvo do dia, ou null se ainda não foi montado. */
export async function fetchSavedPlan(token: string, date: string): Promise<DayPlan | null> {
  try {
    return await apiRequest<DayPlan>(`/api/day-plan/${date}`, { token })
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

/** Monta e salva o plano ("Montar meu plano" / "Montar de novo"). */
export function saveDayPlan(token: string, date: string, body: { start: string; end: string; assistant: boolean }) {
  return apiRequest<DayPlan>(`/api/day-plan/${date}`, { method: 'PUT', token, body })
}

/** RF14: reorganiza o plano salvo a partir de {@code now} ("HH:MM", hora local). */
export function replanDay(token: string, date: string, now: string) {
  return apiRequest<DayPlan>(`/api/day-plan/${date}/replan`, { method: 'POST', token, body: { now } })
}
