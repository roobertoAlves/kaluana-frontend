import type { LinkPermissions } from './domain'

export type UserRole = 'PRIMARY' | 'RESPONSIBLE'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
  nickname?: string | null
  avatarColor?: string | null
  /** Conta nova só entra depois de clicar no link enviado por e-mail. */
  emailVerified?: boolean
}

/** A outra ponta de um emparelhamento (GET /api/pairing/links). */
export interface LinkedUser {
  userId: string
  name: string
  role: UserRole
  linkedAt: string
  /** RF8: o que este vínculo autoriza (o principal edita; o responsável só vê). */
  permissions?: LinkPermissions
}

export interface AuthResponse {
  accessToken: string
  /** RNF4: troca o token de acesso vencido sem pedir login de novo. */
  refreshToken?: string
  user: AuthenticatedUser
}

/** Cadastro com confirmação de e-mail: a conta existe, mas ainda sem sessão. */
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
