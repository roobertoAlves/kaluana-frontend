import type { AmbientMode, Soundscape } from '../features/sounds/soundscape'
import { apiRequest } from './http'

export interface AmbientSession {
  mode: AmbientMode
  sound: Soundscape
  plannedMinutes: number
  status: 'DONE' | 'CANCELED'
  startedAt: number
  finishedAt: number
}

/** RF16 · /api/ambient-sessions. O som toca no aparelho; a API guarda só o registro da sessão. */
export function registerAmbientSession(token: string, s: AmbientSession) {
  return apiRequest<void>('/api/ambient-sessions', {
    method: 'POST',
    token,
    body: {
      mode: s.mode,
      sound: s.sound,
      plannedMinutes: Math.min(120, Math.max(1, s.plannedMinutes)),
      status: s.status,
      startedAt: new Date(s.startedAt).toISOString(),
      finishedAt: new Date(s.finishedAt).toISOString(),
    },
  })
}
