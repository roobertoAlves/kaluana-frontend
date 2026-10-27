import { useStoredObject } from './useStoredObject'

export interface LocalProfile {
  nickname: string
  displayName: string
  avatarColor: string
  language: 'pt-BR'
  theme: 'light'
}

export const AVATAR_COLORS = ['#E9782D', '#3E7BCE', '#7DAA84', '#F2C94C', '#1F3556'] as const

export const DEFAULT_PROFILE: LocalProfile = {
  nickname: '',
  displayName: '',
  avatarColor: AVATAR_COLORS[0],
  language: 'pt-BR',
  theme: 'light',
}

/** Preferências de perfil guardadas no aparelho (ainda sem endpoint no back-end). */
export function useProfile() {
  return useStoredObject<LocalProfile>('profile', DEFAULT_PROFILE)
}
