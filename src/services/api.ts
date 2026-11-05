import type {
  AuthResponse,
  LoginPayload,
  RegisterPrimaryPayload,
  RegisterResponsiblePayload,
  RegisterResponse,
  ValidateCodePayload,
  ValidateCodeResponse,
  GenerateCodeResponse,
} from '../types'
import { apiRequest } from './http'

/**
 * Rotas de autenticação e emparelhamento. O fetch, os headers e a tradução
 * de erros ficam em http.ts, compartilhado com os módulos de cada feature.
 */

export { ApiError } from './http'

function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: payload })
}

function registerPrimary(payload: RegisterPrimaryPayload) {
  return apiRequest<RegisterResponse>('/api/auth/register/primary', { method: 'POST', body: payload })
}

function validateCode(payload: ValidateCodePayload) {
  return apiRequest<ValidateCodeResponse>('/api/pairing/validate-code', { method: 'POST', body: payload })
}

function registerResponsible(payload: RegisterResponsiblePayload) {
  return apiRequest<RegisterResponse>('/api/auth/register/responsible', { method: 'POST', body: payload })
}

function refreshSession(refreshToken: string) {
  return apiRequest<AuthResponse>('/api/auth/refresh', { method: 'POST', body: { refreshToken }, retryOn401: false })
}

function logout(refreshToken: string) {
  return apiRequest<void>('/api/auth/logout', { method: 'POST', body: { refreshToken }, retryOn401: false })
}

/** Novo link de confirmação. A API responde 202 sempre (não diz se o e-mail existe). */
function resendConfirmation(email: string) {
  return apiRequest<void>('/api/auth/resend-confirmation', { method: 'POST', body: { email } })
}

function generateCode(token: string) {
  return apiRequest<GenerateCodeResponse>('/api/pairing/generate-code', { method: 'POST', token })
}

export { login, registerPrimary, registerResponsible, validateCode, generateCode, refreshSession, logout, resendConfirmation }
