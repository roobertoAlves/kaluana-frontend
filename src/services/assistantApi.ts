import { apiRequest } from './http'

/**
 * RF11 · assistente de IA (opcional, desligado por padrão no servidor). O app
 * só mostra os botões do assistente se o status disser que está ligado.
 */
export interface AssistantStatus {
  enabled: boolean
  model: string | null
}

export function fetchAssistantStatus(token: string) {
  return apiRequest<AssistantStatus>('/api/assistant/status', { token })
}

/** Sugestão de microetapas; nada é salvo até o usuário escolher. */
export function suggestSteps(token: string, taskId: string) {
  return apiRequest<{ steps: string[] }>(`/api/assistant/tasks/${taskId}/steps`, { method: 'POST', token })
}
