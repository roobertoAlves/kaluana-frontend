import type { ReportSummary } from '../features/reports/buildReport'
import { apiRequest } from './http'

/** RF7 · relatório da própria conta (todas as seções). */
export function fetchOwnReport(token: string, days: number) {
  return apiRequest<ReportSummary>(`/api/reports?days=${days}`, { token })
}

/** RF7/RF8 · relatório de quem está emparelhado, já filtrado pelo consentimento no servidor. */
export function fetchLinkedReport(token: string, primaryUserId: string, days: number) {
  return apiRequest<ReportSummary>(`/api/reports/linked/${primaryUserId}?days=${days}`, { token })
}
