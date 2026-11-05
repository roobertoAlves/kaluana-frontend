import type { LinkedUser } from '../types'
import type { LinkPermissions } from '../types/domain'
import { apiRequest } from './http'

export function listLinks(token: string) {
  return apiRequest<LinkedUser[]>('/api/pairing/links', { token })
}

export function updatePermissions(token: string, responsibleId: string, permissions: LinkPermissions) {
  return apiRequest<LinkPermissions>(`/api/pairing/links/${responsibleId}/permissions`, { method: 'PUT', token, body: permissions })
}

export function unlink(token: string, otherUserId: string) {
  return apiRequest<void>(`/api/pairing/links/${otherUserId}`, { method: 'DELETE', token })
}
