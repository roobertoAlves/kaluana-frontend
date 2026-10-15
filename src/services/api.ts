import type {
  AuthResponse,
  LoginPayload,
  RegisterPrimaryPayload,
  RegisterResponsiblePayload,
  ValidateCodePayload,
  ValidateCodeResponse,
  GenerateCodeResponse,
} from '../types'
import { getApiBaseUrl } from './runtimeConfig'

/**
 * Porte de src/services/api.ts do projeto web. A versão web trocou
 * fetch por CapacitorHttp para contornar restrições de CORS/rede do
 * WebView. Isso não existe no React Native: o fetch aqui já é nativo
 * (mesma pilha de rede do sistema operacional), então voltamos ao
 * fetch puro, mais simples e sem dependência extra.
 */

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function requestGet<TResponse>(path: string, token: string): Promise<TResponse> {
  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
  } catch {
    throw new ApiError(
      `Erro de conexão com ${getApiBaseUrl()}. Verifique se o backend está no ar e tente novamente.`,
      0,
    )
  }
  if (!response.ok) {
    throw new ApiError('Não foi possível concluir a operação.', response.status)
  }
  return (await response.json()) as TResponse
}

async function request<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      `Erro de conexão com ${getApiBaseUrl()}. Verifique se o backend está no ar e tente novamente.`,
      0,
    )
  }

  if (!response.ok) {
    const fallbackMessages: Record<number, string> = {
      400: 'Confira os dados informados e tente novamente.',
      401: 'E-mail ou senha inválidos.',
      404: 'Código de sincronização não encontrado.',
      409: 'Este e-mail já está cadastrado.',
      410: 'Este código de sincronização expirou. Peça um novo ao usuário principal.',
      429: 'Muitas tentativas seguidas. Aguarde um pouco antes de tentar de novo.',
    }

    let message = fallbackMessages[response.status] ?? 'Não foi possível concluir a operação.'

    try {
      const data = (await response.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch {
      // corpo vazio ou não-JSON: mantém a mensagem padrão acima
    }

    throw new ApiError(message, response.status)
  }

  return (await response.json()) as TResponse
}

function login(payload: LoginPayload) {
  return request<AuthResponse>('/api/auth/login', payload)
}

function registerPrimary(payload: RegisterPrimaryPayload) {
  return request<AuthResponse>('/api/auth/register/primary', payload)
}

function validateCode(payload: ValidateCodePayload) {
  return request<ValidateCodeResponse>('/api/pairing/validate-code', payload)
}

function registerResponsible(payload: RegisterResponsiblePayload) {
  return request<AuthResponse>('/api/auth/register/responsible', payload)
}

function generateCode(token: string) {
  return requestGet<GenerateCodeResponse>('/api/pairing/generate-code', token)
}

export { login, registerPrimary, registerResponsible, validateCode, generateCode }
