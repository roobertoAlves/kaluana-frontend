import type { LinkedUser } from '../types'
import { apiRequest } from './http'

/** RF6 · vínculos já feitos: quem está do outro lado e como desfazer. */
export function listLinks(token: string) {
  return apiRequest<LinkedUser[]>('/api/pairing/links', { token })
}

export function unlink(token: string, otherUserId: string) {
  return apiRequest<void>(`/api/pairing/links/${otherUserId}`, { method: 'DELETE', token })
}
