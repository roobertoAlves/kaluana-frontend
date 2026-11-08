import type { AccessSettings } from '../types/domain'
import type { AccessLogEntry } from '../features/access/accessLog'
import type { ObjectRemote } from '../hooks/useStoredObject'
import { apiRequest } from './http'

export const accessRemote: ObjectRemote<AccessSettings> = {
  load: (token) => apiRequest<AccessSettings>('/api/access-settings', { token }),
  save: (token, value) => apiRequest<AccessSettings>('/api/access-settings', { method: 'PUT', token, body: value }),
}

export function fetchAccessLogs(token: string) {
  return apiRequest<AccessLogEntry[]>('/api/access-logs', { token })
}
