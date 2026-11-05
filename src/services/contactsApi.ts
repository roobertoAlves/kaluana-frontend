import type { TrustedContact } from '../types/domain'
import type { CollectionSource } from '../hooks/useCollection'
import { apiRequest } from './http'

const toBody = (c: TrustedContact) => ({ name: c.name, method: c.method, value: c.value })

export const contactsSource: CollectionSource<TrustedContact> = {
  name: 'contacts',
  remote: {
    list: (token) => apiRequest<TrustedContact[]>('/api/contacts', { token }),
    create: (token, c) => apiRequest<TrustedContact>('/api/contacts', { method: 'POST', token, body: toBody(c) }),
    update: (token, c) => apiRequest<TrustedContact>(`/api/contacts/${c.id}`, { method: 'PUT', token, body: toBody(c) }),
    remove: (token, id) => apiRequest<void>(`/api/contacts/${id}`, { method: 'DELETE', token }),
  },
}
