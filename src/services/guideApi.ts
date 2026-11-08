import { apiRequest } from './http'
import type { GuideSummary } from '../features/guide/guideMachine'

export interface GuideSessionRecord extends GuideSummary {
  id: string
}

export function recordGuideSession(token: string, summary: GuideSummary) {
  return apiRequest<GuideSessionRecord>('/api/guide-sessions', { method: 'POST', token, body: summary })
}

export function fetchGuideSessions(token: string) {
  return apiRequest<GuideSessionRecord[]>('/api/guide-sessions', { token })
}
