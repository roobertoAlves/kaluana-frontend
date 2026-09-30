import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'kaluana:api-base-url-override'

/**
 * Porte de src/services/runtimeConfig.ts do projeto web. Diferença
 * importante: localStorage é síncrono, AsyncStorage não é. Para manter
 * getApiBaseUrl() síncrono (chamado em todo request da API), o valor
 * fica em cache numa variável de módulo, carregado uma vez no início do
 * app (ver initRuntimeConfig, chamado em App.tsx) e atualizado a cada
 * set. Enquanto o cache não foi hidratado, getApiBaseUrl() usa o valor
 * de build — a troca salva no app anterior só passa a valer depois que
 * initRuntimeConfig() resolver, uma única vez por abertura do app.
 */

let cachedOverride: string | null = null
let hydrated = false

export async function initRuntimeConfig(): Promise<void> {
  try {
    cachedOverride = await AsyncStorage.getItem(STORAGE_KEY)
  } catch {
    cachedOverride = null
  } finally {
    hydrated = true
  }
}

export function getApiBaseUrl(): string {
  if (cachedOverride) return cachedOverride

  const url = process.env.EXPO_PUBLIC_API_BASE_URL
  if (!url) {
    if (__DEV__) {
      console.warn('EXPO_PUBLIC_API_BASE_URL não definida. Usando localhost.')
    }
    return 'http://localhost:8080'
  }
  return url
}

export async function setApiBaseUrlOverride(url: string | null): Promise<void> {
  const trimmed = url && url.trim() ? url.trim() : null
  cachedOverride = trimmed

  try {
    if (trimmed) {
      await AsyncStorage.setItem(STORAGE_KEY, trimmed)
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage indisponível: a troca vale só para a sessão atual do app,
    // em memória, sem persistir para a próxima abertura.
  }
}

export function getApiBaseUrlOverride(): string | null {
  return cachedOverride
}

export function isRuntimeConfigHydrated(): boolean {
  return hydrated
}

// Hook de depuração: no Metro/Hermes debugger, rode
// `global.kaluanaConfig.setApiBaseUrlOverride('https://homolog.kaluana.com.br')`
// para trocar de ambiente sem gerar um novo build.
declare global {
  var kaluanaConfig:
    | {
        getApiBaseUrl: typeof getApiBaseUrl
        setApiBaseUrlOverride: typeof setApiBaseUrlOverride
        getApiBaseUrlOverride: typeof getApiBaseUrlOverride
      }
    | undefined
}

;(globalThis as typeof globalThis & { kaluanaConfig?: unknown }).kaluanaConfig = {
  getApiBaseUrl,
  setApiBaseUrlOverride,
  getApiBaseUrlOverride,
}
