import { create, isAxiosError } from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getApiBaseUrl } from './runtimeConfig'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  token?: string | null
  retryOn401?: boolean
}

interface RetryConfig extends InternalAxiosRequestConfig {
  retryOn401?: boolean
  retried?: boolean
}

type SessionRefresher = () => Promise<string | null>
let sessionRefresher: SessionRefresher | null = null

export function setSessionRefresher(fn: SessionRefresher | null) {
  sessionRefresher = fn
}

const FALLBACK_MESSAGES: Record<number, string> = {
  400: 'Confira os dados informados e tente novamente.',
  401: 'E-mail ou senha inválidos.',
  403: 'Você não tem permissão para acessar este recurso.',
  404: 'Código de sincronização não encontrado.',
  409: 'Este e-mail já está cadastrado.',
  410: 'Este código de sincronização expirou. Peça um novo ao usuário principal.',
  429: 'Muitas tentativas seguidas. Aguarde um pouco antes de tentar de novo.',
}

export const api = create({ timeout: 15000 })

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  return config
})

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryConfig | undefined
  const hadToken = !!config?.headers?.Authorization
  if (error.response?.status !== 401 || !config || !hadToken || config.retryOn401 === false || config.retried || !sessionRefresher) {
    throw error
  }
  const fresh = await sessionRefresher()
  if (!fresh) throw error
  config.retried = true
  config.headers.Authorization = `Bearer ${fresh}`
  return api.request(config)
})

export async function apiRequest<TResponse>(path: string, { method = 'GET', body, token, retryOn401 = true }: RequestOptions = {}): Promise<TResponse> {
  try {
    const response = await api.request<TResponse>({
      url: path,
      method,
      data: body,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      retryOn401,
    } as RetryConfig)
    return (response.status === 204 ? undefined : response.data) as TResponse
  } catch (e) {
    throw toApiError(e)
  }
}

export async function checkApi(baseUrl: string): Promise<boolean> {
  try {
    const response = await api.get<{ status?: string }>(`${baseUrl}/actuator/health`, { timeout: 5000 })
    return response.data?.status === 'UP'
  } catch {
    return false
  }
}

function toApiError(e: unknown): ApiError {
  if (e instanceof ApiError) return e
  if (!isAxiosError(e) || !e.response) {
    return new ApiError(
      `Não foi possível conectar à API em ${getApiBaseUrl()}. Confira se ela está no ar e se o celular está na mesma rede do computador.`,
      0,
    )
  }
  const data = e.response.data as { message?: string } | undefined
  const message = data?.message || FALLBACK_MESSAGES[e.response.status] || 'Não foi possível concluir a operação.'
  return new ApiError(message, e.response.status)
}

export function errorMessage(e: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  return e instanceof ApiError ? e.message : fallback
}
