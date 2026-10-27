import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Persistência local por usuário (funciona offline). Chave:
 * kaluana:<userId>:<nome>. Quando o back-end de sincronização existir, esta
 * camada vira o "outbox" local; as telas não precisam mudar.
 */
const key = (userId: string, name: string) => `kaluana:${userId}:${name}`

export async function readJson<T>(userId: string, name: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key(userId, name))
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export async function writeJson<T>(userId: string, name: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key(userId, name), JSON.stringify(value))
  } catch {
    // Sem storage: o dado fica só em memória nesta sessão.
  }
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function todayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
