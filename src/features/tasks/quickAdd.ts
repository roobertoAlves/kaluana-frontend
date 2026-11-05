import type { TaskPriority } from '../../types/domain.ts'
import { MAX_STEPS } from './taskModel.ts'



export type QuickKind = 'date' | 'minutes' | 'priority' | 'steps'

export interface QuickToken {
  kind: QuickKind
  
  label: string
}

export interface QuickParse {
  title: string
  dueDate: string | null
  estimatedMinutes: number | null
  priority: TaskPriority | null
  steps: string[]
  tokens: QuickToken[]
}

const MIN_MINUTES = 5
const MAX_MINUTES = 480
const MAX_TEXT = 120

const WEEKDAYS: [RegExp, number, string][] = [
  [/domingo/iu, 0, 'domingo'],
  [/segunda/iu, 1, 'segunda'],
  [/ter[çc]a/iu, 2, 'terça'],
  [/quarta/iu, 3, 'quarta'],
  [/quinta/iu, 4, 'quinta'],
  [/sexta/iu, 5, 'sexta'],
  [/s[áa]bado/iu, 6, 'sábado'],
]

const PRIORITY: Record<string, [TaskPriority, string]> = {
  alta: ['HIGH', 'prioridade alta'],
  media: ['MEDIUM', 'prioridade média'],
  baixa: ['LOW', 'prioridade baixa'],
}

const pad = (n: number) => String(n).padStart(2, '0')
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const short = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()


const word = (body: string) => new RegExp(`(^|\\s)(${body})(?=$|[\\s,.!?])`, 'iu')

interface Rule {
  kind: Exclude<QuickKind, 'steps'>
  pattern: RegExp
  
  read: (m: RegExpMatchArray, today: Date) => { value: string | number; label: string } | null
}

const datePrefix = '(?:(?:at[ée]|para|pra)\\s+)?'

const RULES: Rule[] = [
  {
    kind: 'date',
    pattern: word(`${datePrefix}depois\\s+de\\s+amanh[ãa]`),
    read: (_, t) => { const d = addDays(t, 2); return { value: key(d), label: `depois de amanhã · ${short(d)}` } },
  },
  {
    kind: 'date',
    pattern: word(`${datePrefix}amanh[ãa]`),
    read: (_, t) => { const d = addDays(t, 1); return { value: key(d), label: `amanhã · ${short(d)}` } },
  },
  { kind: 'date', pattern: word(`${datePrefix}hoje`), read: (_, t) => ({ value: key(t), label: 'hoje' }) },
  {
    kind: 'date',
    pattern: word(`${datePrefix}(?:(?:n[ao]|nest[ae]|pr[óo]xim[ao])\\s+)?(?:domingo|segunda|ter[çc]a|quarta|quinta|sexta|s[áa]bado)(?:-feira)?`),
    read: (m, t) => {
      const found = WEEKDAYS.find(([re]) => re.test(m[2]))
      if (!found) return null

      const ahead = ((found[1] - t.getDay() + 7) % 7) || 7
      const d = addDays(t, ahead)
      return { value: key(d), label: `${found[2]} · ${short(d)}` }
    },
  },
  {
    kind: 'date',
    pattern: word(`${datePrefix}(\\d{1,2})/(\\d{1,2})(?:/(\\d{4}))?`),
    read: (m, t) => {
      const day = Number(m[3])
      const month = Number(m[4]) - 1
      const explicitYear = m[5] ? Number(m[5]) : null
      let d = new Date(explicitYear ?? t.getFullYear(), month, day)
      if (d.getMonth() !== month || d.getDate() !== day) return null
      if (explicitYear === null && key(d) < key(t)) d = new Date(t.getFullYear() + 1, month, day)
      return { value: key(d), label: short(d) }
    },
  },
  {
    kind: 'date',
    pattern: word(`${datePrefix}dia\\s+(\\d{1,2})`),
    read: (m, t) => {
      const day = Number(m[3])
      if (day < 1 || day > 31) return null

      for (let i = 0; i < 13; i++) {
        const d = new Date(t.getFullYear(), t.getMonth() + i, day)
        if (d.getDate() === day && key(d) >= key(t)) return { value: key(d), label: `dia ${day} · ${short(d)}` }
      }
      return null
    },
  },
  {
    kind: 'minutes',
    pattern: word('(\\d{1,2})\\s*(?:h|horas?)(?:\\s*(?:e\\s*)?(\\d{1,2})\\s*(?:min|minutos?|m)?)?'),
    read: (m) => {
      const total = Number(m[3]) * 60 + (m[4] ? Number(m[4]) : 0)
      const label = m[4] ? `${m[3]}h${pad(Number(m[4]))}` : `${m[3]}h`
      return { value: total, label }
    },
  },
  {
    kind: 'minutes',
    pattern: word('(\\d{1,3})\\s*(?:min|minutos?|m)'),
    read: (m) => ({ value: Number(m[3]), label: `${Number(m[3])} min` }),
  },
  {
    kind: 'priority',
    pattern: word('!(alta|m[ée]dia|baixa)'),
    read: (m) => { const [value, label] = PRIORITY[strip(m[3])]; return { value, label } },
  },
]

export function parseQuickTask(input: string, today: Date = new Date(), ignore: ReadonlySet<QuickKind> = new Set()): QuickParse {
  const parts = ignore.has('steps') ? [input] : input.split(';')
  let rest = parts[0]
  const steps = parts
    .slice(1)
    .map((s) => s.trim().slice(0, MAX_TEXT))
    .filter(Boolean)
    .slice(0, MAX_STEPS)

  const result: QuickParse = { title: '', dueDate: null, estimatedMinutes: null, priority: null, steps, tokens: [] }
  const taken = new Set<QuickKind>()

  for (const rule of RULES) {
    if (ignore.has(rule.kind) || taken.has(rule.kind)) continue
    const m = rest.match(rule.pattern)
    if (!m || m.index === undefined) continue
    const read = rule.read(m, today)
    if (!read) continue
    if (rule.kind === 'minutes' && (Number(read.value) < MIN_MINUTES || Number(read.value) > MAX_MINUTES)) continue

    taken.add(rule.kind)
    result.tokens.push({ kind: rule.kind, label: read.label })
    if (rule.kind === 'date') result.dueDate = String(read.value)
    if (rule.kind === 'minutes') result.estimatedMinutes = Number(read.value)
    if (rule.kind === 'priority') result.priority = read.value as TaskPriority

    const start = m.index + m[1].length
    rest = `${rest.slice(0, start)} ${rest.slice(start + m[2].length)}`
  }
  if (steps.length > 0) result.tokens.push({ kind: 'steps', label: `${steps.length} ${steps.length === 1 ? 'microetapa' : 'microetapas'}` })

  const title = rest.replace(/\s+/g, ' ').replace(/^[\s,.;-]+|[\s,;-]+$/g, '').trim()
  if (!title) {

    const whole = input.replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT)
    return { title: whole, dueDate: null, estimatedMinutes: null, priority: null, steps: [], tokens: [] }
  }
  result.title = (title.charAt(0).toUpperCase() + title.slice(1)).slice(0, MAX_TEXT)
  return result
}
