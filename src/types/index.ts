export type UserRole = 'PRIMARY' | 'RESPONSIBLE'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
  nickname?: string | null
  avatarColor?: string | null
}

/** A outra ponta de um emparelhamento (GET /api/pairing/links). */
export interface LinkedUser {
  userId: string
  name: string
  role: UserRole
  linkedAt: string
}

export interface AuthResponse {
  accessToken: string
  /** RNF4: troca o token de acesso vencido sem pedir login de novo. */
  refreshToken?: string
  user: AuthenticatedUser
}

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
