import { useEffect, useRef } from 'react'
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio'
import type { AudioPlayer } from 'expo-audio'
import type { TimerSound } from '../features/timer/timerSession'
import { SOUNDS } from '../features/sounds/soundscape'

/**
 * RF9/RF16: ruídos e paisagens sonoras. Os arquivos são gerados pela equipe
 * (scripts/generate-noise.mjs) e vêm dentro do app: nada de streaming nem custo.
 */
const SOURCES: Record<Exclude<TimerSound, 'NONE'>, number> = {
  WHITE: require('../../assets/sounds/white-noise.wav'),
  PINK: require('../../assets/sounds/pink-noise.wav'),
  BROWN: require('../../assets/sounds/brown-noise.wav'),
  RAIN: require('../../assets/sounds/rain.wav'),
  WAVES: require('../../assets/sounds/waves.wav'),
  FIRE: require('../../assets/sounds/fire.wav'),
  FOREST: require('../../assets/sounds/forest.wav'),
}

export const DEFAULT_VOLUME = 0.6

export const SOUND_OPTIONS: { value: TimerSound; label: string }[] = [
  { value: 'NONE', label: 'Sem som' },
  ...SOUNDS.map((s) => ({ value: s.value, label: s.label })),
]

/**
 * Toca em loop enquanto {@code playing} for true. O player é criado e liberado
 * aqui dentro: pausar ou encerrar a sessão solta o recurso de áudio na hora.
 * {@code volume} pode mudar sem recriar o player (o Dormir diminui aos poucos).
 */
export function useAmbientSound(sound: TimerSound, playing: boolean, volume: number = DEFAULT_VOLUME) {
  const player = useRef<AudioPlayer | null>(null)
  const latestVolume = useRef(volume)

  useEffect(() => {
    latestVolume.current = volume
    if (player.current) player.current.volume = volume
  }, [volume])

  useEffect(() => {
    if (sound === 'NONE' || !playing) return undefined

    // Toca mesmo com o aparelho no modo silencioso: o usuário escolheu o som.
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {})
    const p = createAudioPlayer(SOURCES[sound])
    p.loop = true
    p.volume = latestVolume.current
    p.play()
    player.current = p
    return () => {
      player.current = null
      p.remove()
    }
  }, [sound, playing])
}
