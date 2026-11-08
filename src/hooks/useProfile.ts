import { useStoredObject } from './useStoredObject'
import { DEFAULT_PROFILE } from '../features/profile/profile'
import type { LocalProfile } from '../features/profile/profile'
import { profileRemote } from '../services/profileApi'

export { AVATAR_COLORS, DEFAULT_PROFILE } from '../features/profile/profile'
export type { LocalProfile } from '../features/profile/profile'

export function useProfile() {
  return useStoredObject<LocalProfile>('profile', DEFAULT_PROFILE, profileRemote)
}
