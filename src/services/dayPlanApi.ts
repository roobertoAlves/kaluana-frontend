import type { DayPlan } from '../types/domain'
import { apiRequest } from './http'

/**
 * RF10/RF11 · GET /api/day-plan. Data e horários vão do aparelho porque o
 * servidor não sabe o fuso do usuário.
 */
export function fetchDayPlan(token: string, params: { date: string; start: string; end: string; assistant: boolean }) {
  const query = new URLSearchParams({
    date: params.date,
    start: params.start,
    end: params.end,
    assistant: String(params.assistant),
  })
  return apiRequest<DayPlan>(`/api/day-plan?${query.toString()}`, { token })
}
