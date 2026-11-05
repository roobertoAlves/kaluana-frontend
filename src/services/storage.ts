import AsyncStorage from '@react-native-async-storage/async-storage'

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
  } catch {}
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export function todayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
