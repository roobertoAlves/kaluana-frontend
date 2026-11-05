import type { LinkPermissions } from './domain'

export type UserRole = 'PRIMARY' | 'RESPONSIBLE'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
  nickname?: string | null
  avatarColor?: string | null
  
  emailVerified?: boolean
}

export interface LinkedUser {
  userId: string
  name: string
  role: UserRole
  linkedAt: string
  permissions?: LinkPermissions
}

export interface AuthResponse {
  accessToken: string
  refreshToken?: string
  user: AuthenticatedUser
}


export interface PendingConfirmation {
  user: AuthenticatedUser
}

export type RegisterResponse = AuthResponse | PendingConfirmation

export const isPendingConfirmation = (r: RegisterResponse): r is PendingConfirmation => !('accessToken' in r) || !r.accessToken

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPrimaryPayload {
  name: string
  email: string
  password: string
}

export interface ValidateCodePayload {
  code: string
}

export interface ValidateCodeResponse {
  valid: boolean
  mainPersonName: string
}

export interface GenerateCodeResponse {
  code: string
  expiresAt: string
}

export interface RegisterResponsiblePayload {
  name: string
  email: string
  password: string
  code: string
}
