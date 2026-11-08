import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { DEFAULT_API_PORT, apiUrlFromHost } from '../features/api/apiAddress'

const STORAGE_KEY = 'kaluana:api-base-url-override'
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_API_PORT

let cachedOverride: string | null = null

export async function initRuntimeConfig(): Promise<void> {
  try {
    cachedOverride = await AsyncStorage.getItem(STORAGE_KEY)
  } catch {
    cachedOverride = null
  }
}

function devServerHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost
  if (hostUri) return hostUri
  if (Platform.OS === 'web' && typeof window !== 'undefined') return window.location.host
  return null
}

export function getAutomaticApiBaseUrl(): string {
  return apiUrlFromHost(devServerHost(), API_PORT)
}

export function getApiBaseUrl(): string {
  return cachedOverride || process.env.EXPO_PUBLIC_API_BASE_URL || getAutomaticApiBaseUrl()
}

export function getApiBaseUrlOverride(): string | null {
  return cachedOverride
}

export async function setApiBaseUrlOverride(url: string | null): Promise<void> {
  cachedOverride = url && url.trim() ? url.trim() : null
  try {
    if (cachedOverride) await AsyncStorage.setItem(STORAGE_KEY, cachedOverride)
    else await AsyncStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
