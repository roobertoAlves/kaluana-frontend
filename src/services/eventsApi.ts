import type { LifeEvent } from '../types/domain'
import type { CollectionSource } from '../hooks/useCollection'
import { apiRequest } from './http'

/** RF1 · /api/events. A API não edita eventos: só cria, lista e apaga. */
export const eventsSource: CollectionSource<LifeEvent> = {
  name: 'events',
  remote: {
    list: (token) => apiRequest<LifeEvent[]>('/api/events', { token }),
    create: (token, e) =>
      apiRequest<LifeEvent>('/api/events', {
        method: 'POST',
        token,
        body: { category: e.category, text: e.text ?? null, urgent: e.urgent, timestamp: e.timestamp },
      }),
    remove: (token, id) => apiRequest<void>(`/api/events/${id}`, { method: 'DELETE', token }),
  },
}
