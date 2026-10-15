export type UserRole = 'PRIMARY' | 'RESPONSIBLE'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthResponse {
  accessToken: string
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
