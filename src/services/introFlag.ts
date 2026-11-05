import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'kaluana:intro-seen'

export async function hasSeenIntro(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === '1'
  } catch {
    return false
  }
}

export async function markIntroSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, '1')
  } catch {}
}
