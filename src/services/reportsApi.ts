import type { ReportSummary } from '../features/reports/buildReport'
import { apiRequest } from './http'

export function fetchOwnReport(token: string, days: number) {
  return apiRequest<ReportSummary>(`/api/reports?days=${days}`, { token })
}

export function fetchLinkedReport(token: string, primaryUserId: string, days: number) {
  return apiRequest<ReportSummary>(`/api/reports/linked/${primaryUserId}?days=${days}`, { token })
}
