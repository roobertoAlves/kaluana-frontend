import type { LinkedUser } from '../types'
import type { LinkPermissions } from '../types/domain'
import { apiRequest } from './http'

/** RF6 · vínculos já feitos: quem está do outro lado e como desfazer. */
export function listLinks(token: string) {
  return apiRequest<LinkedUser[]>('/api/pairing/links', { token })
}

/** RF8 · o principal define o que cada pessoa vinculada pode ver. */
export function updatePermissions(token: string, responsibleId: string, permissions: LinkPermissions) {
  return apiRequest<LinkPermissions>(`/api/pairing/links/${responsibleId}/permissions`, { method: 'PUT', token, body: permissions })
}

export function unlink(token: string, otherUserId: string) {
  return apiRequest<void>(`/api/pairing/links/${otherUserId}`, { method: 'DELETE', token })
}
