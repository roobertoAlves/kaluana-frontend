import type { DayFeeling, ReviewMove } from '../features/review/dayReview'
import { apiRequest } from './http'

export interface DayReviewResult {
  date: string
  feeling: DayFeeling | null
  movedTomorrow: number
  unscheduled: number
  completed: number
}

/** RF17 · PUT /api/day-reviews/{date}: aplica as decisões numa transação e guarda o resumo. */
export function saveDayReview(token: string, date: string, body: { feeling: DayFeeling | null; moves: ReviewMove[] }) {
  return apiRequest<DayReviewResult>(`/api/day-reviews/${date}`, { method: 'PUT', token, body })
}
