import { useEffect } from 'react'
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import type { TimerSound } from '../features/timer/timerSession'

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

export function useAmbientSound(sound: TimerSound, playing: boolean) {
  useEffect(() => {
    if (sound === 'NONE' || !playing) return undefined

    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {})
    const player = createAudioPlayer(SOURCES[sound])
    player.loop = true
    player.volume = 0.6
    player.play()
    return () => {
      player.pause()
      player.remove()
    }
  }, [sound, playing])
}
