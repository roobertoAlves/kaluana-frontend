import { apiRequest } from './http'

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
