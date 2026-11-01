import { getApiBaseUrl } from './runtimeConfig'

/**
 * Cliente HTTP único do app: monta a URL, envia o token, traduz erros da API
 * (formato ApiError do back-end: { status, message, fieldErrors }) e trata
 * 204 sem corpo. Os módulos de cada feature (eventsApi, remindersApi...) só
 * descrevem rota e formato; nenhum chama fetch direto.
 */

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

export async function apiRequest<TResponse>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<TResponse> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      `Erro de conexão com ${getApiBaseUrl()}. Verifique se o backend está no ar e tente novamente.`,
      0,
    )
  }

  if (!response.ok) {
    let message = FALLBACK_MESSAGES[response.status] ?? 'Não foi possível concluir a operação.'
    try {
      const data = (await response.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch {
      // corpo vazio ou não-JSON: mantém a mensagem padrão acima
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as TResponse
  return (await response.json()) as TResponse
}

export function errorMessage(e: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  return e instanceof ApiError ? e.message : fallback
}
