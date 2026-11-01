import type { CheckIn } from '../types/domain'
import type { CollectionSource } from '../hooks/useCollection'
import { apiRequest } from './http'

/** RF3 · /api/check-ins. PUT por data: criar e atualizar o dia é a mesma chamada. */
const record = (token: string, c: CheckIn) =>
  apiRequest<CheckIn>(`/api/check-ins/${c.date}`, { method: 'PUT', token, body: { level: c.level } })

export const checkInsSource: CollectionSource<CheckIn> = {
  name: 'checkins',
  remote: {
    list: (token) => apiRequest<CheckIn[]>('/api/check-ins', { token }),
    create: record,
    update: record,
  },
}
