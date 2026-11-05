import type { DayPlan } from '../types/domain'
import { ApiError, apiRequest } from './http'

export async function fetchSavedPlan(token: string, date: string): Promise<DayPlan | null> {
  try {
    return await apiRequest<DayPlan>(`/api/day-plan/${date}`, { token })
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null
    throw e
  }
}

export function saveDayPlan(token: string, date: string, body: { start: string; end: string; assistant: boolean }) {
  return apiRequest<DayPlan>(`/api/day-plan/${date}`, { method: 'PUT', token, body })
}

export function replanDay(token: string, date: string, now: string) {
  return apiRequest<DayPlan>(`/api/day-plan/${date}/replan`, { method: 'POST', token, body: { now } })
}
