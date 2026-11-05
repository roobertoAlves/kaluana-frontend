import type { TimerSound } from '../timer/timerSession.ts'



export type AmbientMode = 'RELAX' | 'SLEEP'
export type Soundscape = Exclude<TimerSound, 'NONE'>

export interface SoundInfo {
  value: Soundscape
  label: string
  description: string
}


export const SOUNDS: SoundInfo[] = [
  { value: 'RAIN', label: 'Chuva', description: 'Chuva fina e constante' },
  { value: 'WAVES', label: 'Ondas', description: 'Mar calmo, vai e vem lento' },
  { value: 'FIRE', label: 'Lareira', description: 'Estalos suaves de lenha' },
  { value: 'FOREST', label: 'Floresta', description: 'Vento leve nas folhas' },
  { value: 'BROWN', label: 'Ruído marrom', description: 'Grave e contínuo' },
  { value: 'PINK', label: 'Ruído rosa', description: 'Equilibrado, como chiado suave' },
  { value: 'WHITE', label: 'Ruído branco', description: 'Agudo, cobre conversas' },
]

export const MODE_MINUTES: Record<AmbientMode, number[]> = {
  RELAX: [5, 10, 15],
  SLEEP: [15, 30, 45],
}

export const soundLabel = (s: TimerSound) => SOUNDS.find((x) => x.value === s)?.label ?? 'Sem som'


export function suggestSound(now: Date = new Date()): { sound: Soundscape; period: string } {
  const h = now.getHours()
  if (h >= 5 && h < 12) return { sound: 'FOREST', period: 'manhã' }
  if (h >= 12 && h < 18) return { sound: 'RAIN', period: 'tarde' }
  return { sound: 'WAVES', period: 'noite' }
}

export const INHALE_MS = 4000
export const EXHALE_MS = 6000


export function breath(elapsedMs: number): { phase: 'in' | 'out'; secondsLeft: number } {
  const t = ((elapsedMs % (INHALE_MS + EXHALE_MS)) + INHALE_MS + EXHALE_MS) % (INHALE_MS + EXHALE_MS)
  return t < INHALE_MS
    ? { phase: 'in', secondsLeft: Math.ceil((INHALE_MS - t) / 1000) }
    : { phase: 'out', secondsLeft: Math.ceil((INHALE_MS + EXHALE_MS - t) / 1000) }
}


export function sleepVolume(elapsedMs: number, totalMs: number, base = 0.6): number {
  if (elapsedMs <= totalMs / 2) return base
  if (elapsedMs >= totalMs) return 0
  return base * ((totalMs - elapsedMs) / (totalMs / 2))
}


export function remainingLabel(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
