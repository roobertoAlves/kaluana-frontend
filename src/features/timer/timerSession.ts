export type TimerStatus = 'RUNNING' | 'PAUSED' | 'DONE' | 'CANCELED'

export type TimerSound = 'NONE' | 'WHITE' | 'PINK' | 'BROWN' | 'RAIN' | 'WAVES' | 'FIRE' | 'FOREST'

export interface TimerSession {
  id: string
  task: string
  taskId: string | null
  totalMs: number
  steps: string[]
  water: boolean
  sound: TimerSound
  muted: boolean
  startedAt: number
  status: TimerStatus
  endsAt: number | null
  remainingMs: number | null
  finishedAt: number | null
}

export const STEP_COLORS = ['#3E7BCE', '#F2C94C', '#7DAA84', '#E9782D'] as const
export const MINUTE = 60_000

export interface StartOptions {
  task: string
  minutes: number
  steps: string[]
  water: boolean
  sound?: TimerSound
  taskId?: string | null
}

export function startTimer(id: string, o: StartOptions, now: number): TimerSession {
  const totalMs = Math.max(1, Math.round(o.minutes)) * MINUTE
  return {
    id,
    task: o.task.trim() || 'Sessão',
    taskId: o.taskId ?? null,
    totalMs,
    steps: o.steps.map((s) => s.trim()).filter(Boolean).slice(0, 4),
    water: o.water,
    sound: o.sound ?? 'NONE',
    muted: false,
    startedAt: now,
    status: 'RUNNING',
    endsAt: now + totalMs,
    remainingMs: null,
    finishedAt: null,
  }
}

export function remainingMs(s: TimerSession, now: number): number {
  if (s.status === 'RUNNING' && s.endsAt !== null) return Math.max(0, s.endsAt - now)
  if (s.status === 'PAUSED' && s.remainingMs !== null) return s.remainingMs
  return 0
}

export function reevaluateTimer(s: TimerSession, now: number): TimerSession {
  if (s.status === 'RUNNING' && s.endsAt !== null && s.endsAt <= now) {
    return { ...s, status: 'DONE', finishedAt: s.endsAt, endsAt: null }
  }
  return s
}

export function pauseTimer(s: TimerSession, now: number): TimerSession {
  if (s.status !== 'RUNNING') return s
  return { ...s, status: 'PAUSED', remainingMs: remainingMs(s, now), endsAt: null }
}

export function resumeTimer(s: TimerSession, now: number): TimerSession {
  if (s.status !== 'PAUSED' || s.remainingMs === null) return s
  return { ...s, status: 'RUNNING', endsAt: now + s.remainingMs, remainingMs: null }
}

export function addMinute(s: TimerSession, now: number): TimerSession {
  if (s.status === 'RUNNING' && s.endsAt !== null) return { ...s, endsAt: s.endsAt + MINUTE, totalMs: s.totalMs + MINUTE }
  if (s.status === 'PAUSED' && s.remainingMs !== null) return { ...s, remainingMs: s.remainingMs + MINUTE, totalMs: s.totalMs + MINUTE }
  return s
}

export function cancelTimer(s: TimerSession, now: number): TimerSession {
  if (s.status === 'DONE' || s.status === 'CANCELED') return s
  return { ...s, status: 'CANCELED', endsAt: null, remainingMs: null, finishedAt: now }
}

export function setMuted(s: TimerSession, muted: boolean): TimerSession {
  return s.muted === muted ? s : { ...s, muted }
}

export const soundPlaying = (s: TimerSession | null) => !!s && s.status === 'RUNNING' && s.sound !== 'NONE' && !s.muted

export function progress(s: TimerSession, now: number): number {
  if (s.status === 'DONE') return 1
  return Math.min(1, Math.max(0, 1 - remainingMs(s, now) / s.totalMs))
}

export function currentStep(s: TimerSession, now: number): number {
  if (s.steps.length === 0) return -1
  return Math.min(s.steps.length - 1, Math.floor(progress(s, now) * s.steps.length))
}

export function formatClock(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const sec = total % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}
