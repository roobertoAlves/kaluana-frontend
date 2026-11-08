import { apiRequest } from './http'
import type { AssistantParsedTask } from '../features/tasks/assistantParse'

export interface AssistantStatus {
  enabled: boolean
  model: string | null
}

export function fetchAssistantStatus(token: string) {
  return apiRequest<AssistantStatus>('/api/assistant/status', { token })
}

export function suggestSteps(token: string, taskId: string) {
  return apiRequest<{ steps: string[] }>(`/api/assistant/tasks/${taskId}/steps`, { method: 'POST', token })
}

export function rankGuideOptions(token: string, question: string, options: string[], energyLevel?: number | null) {
  return apiRequest<{ order: number[] }>('/api/assistant/guide/rank', { method: 'POST', token, body: { question, options, energyLevel: energyLevel ?? null } })
}

export function parseTaskPhrase(token: string, phrase: string, today: string) {
  return apiRequest<AssistantParsedTask>('/api/assistant/tasks/parse', { method: 'POST', token, body: { phrase, today } })
}
