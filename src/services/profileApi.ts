import type { AuthenticatedUser } from '../types'
import type { ObjectRemote } from '../hooks/useStoredObject'
import { DEFAULT_PROFILE } from '../features/profile/profile'
import type { LocalProfile } from '../features/profile/profile'
import { apiRequest } from './http'

const toProfile = (u: AuthenticatedUser): LocalProfile => ({
  ...DEFAULT_PROFILE,
  displayName: u.name,
  nickname: u.nickname ?? '',
  avatarColor: u.avatarColor ?? DEFAULT_PROFILE.avatarColor,
})

export const profileRemote: ObjectRemote<LocalProfile> = {
  load: async (token) => toProfile(await apiRequest<AuthenticatedUser>('/api/users/me', { token })),
  save: async (token, p) =>
    toProfile(
      await apiRequest<AuthenticatedUser>('/api/users/me/profile', {
        method: 'PUT',
        token,
        body: { name: p.displayName, nickname: p.nickname || null, avatarColor: p.avatarColor },
      }),
    ),
}
