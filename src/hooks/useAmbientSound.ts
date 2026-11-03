import { useEffect } from 'react'
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import type { TimerSound } from '../features/timer/timerSession'

/**
 * RF9: som ambiente da sessão de foco. Os arquivos são gerados pela equipe
 * (scripts/generate-noise.mjs) e vêm dentro do app: nada de streaming nem custo.
 */
const SOURCES: Record<Exclude<TimerSound, 'NONE'>, number> = {
  WHITE: require('../../assets/sounds/white-noise.wav'),
  PINK: require('../../assets/sounds/pink-noise.wav'),
  BROWN: require('../../assets/sounds/brown-noise.wav'),
}

export const SOUND_OPTIONS: { value: TimerSound; label: string }[] = [
  { value: 'NONE', label: 'Sem som' },
  { value: 'BROWN', label: 'Ruído marrom' },
  { value: 'PINK', label: 'Ruído rosa' },
  { value: 'WHITE', label: 'Ruído branco' },
]

/**
 * Toca em loop enquanto {@code playing} for true. O player é criado e liberado
 * aqui dentro: pausar ou encerrar a sessão solta o recurso de áudio na hora.
 */
export function useAmbientSound(sound: TimerSound, playing: boolean) {
  useEffect(() => {
    if (sound === 'NONE' || !playing) return undefined

    // Toca mesmo com o aparelho no modo silencioso: o usuário escolheu o som.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {})
    const player = createAudioPlayer(SOURCES[sound])
    player.loop = true
    player.volume = 0.6
    player.play()
    return () => {
      // pause() antes de remove(): no Android, liberar sem pausar deixava o som tocando.
      player.pause()
      player.remove()
    }
  }, [sound, playing])
}
