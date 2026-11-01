import type { Reminder } from '../types/domain'
import type { CollectionSource } from '../hooks/useCollection'
import { apiRequest } from './http'

/** RF2 · /api/reminders. O disparo continua agendado no aparelho (RNF2). */
const toBody = (r: Reminder) => ({
  title: r.title,
  time: r.time,
  leadMinutes: r.leadMinutes,
  frequency: r.frequency,
  insistence: r.insistence,
  enabled: r.enabled,
})

export const remindersSource: CollectionSource<Reminder> = {
  name: 'reminders',
  remote: {
    list: (token) => apiRequest<Reminder[]>('/api/reminders', { token }),
    create: (token, r) => apiRequest<Reminder>('/api/reminders', { method: 'POST', token, body: toBody(r) }),
    update: (token, r) => apiRequest<Reminder>(`/api/reminders/${r.id}`, { method: 'PUT', token, body: toBody(r) }),
    remove: (token, id) => apiRequest<void>(`/api/reminders/${id}`, { method: 'DELETE', token }),
  },
}
