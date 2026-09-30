import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'kaluana:intro-seen'

/**
 * Marca se a splash do IF já foi exibida neste aparelho. Ela aparece uma
 * única vez, na primeira abertura do app; depois disso quem assume é a
 * splash padrão.
 */
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
  } catch {
    // Sem storage: na próxima abertura a splash do IF pode aparecer de novo.
  }
}
