const pad = (n: number) => String(n).padStart(2, '0')

export function parseTime(hhmm: string): { hour: number; minute: number } {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return { hour: 0, minute: 0 }
  return { hour: Math.min(23, Number(m[1])), minute: Math.min(59, Number(m[2])) }
}

export const formatTime = (hour: number, minute: number) => `${pad(hour)}:${pad(minute)}`

export const timeOfDate = (d: Date) => formatTime(d.getHours(), d.getMinutes())

export function dateWithTime(hhmm: string, base: Date = new Date()): Date {
  const { hour, minute } = parseTime(hhmm)
  const d = new Date(base)
  d.setHours(hour, minute, 0, 0)
  return d
}

export function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export const formatDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function dayLabel(day: string, today: Date = new Date()): string {
  const t = formatDay(today)
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  if (day === t) return 'hoje'
  if (day === formatDay(tomorrow)) return 'amanhã'
  const d = parseDay(day)
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export const clampMinutes = (minutes: number, min: number, max: number) => Math.max(min, Math.min(max, Math.round(minutes)))

export const wheelRange = (max: number, step = 1) => Array.from({ length: Math.floor(max / step) + 1 }, (_, i) => i * step)
