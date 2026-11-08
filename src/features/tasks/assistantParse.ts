import type { TaskPriority } from '../../types/domain.ts'
import type { QuickKind, QuickParse, QuickToken } from './quickAdd.ts'
import { MAX_STEPS } from './taskModel.ts'

export interface AssistantParsedTask {
  title: string
  dueDate: string | null
  estimatedMinutes: number | null
  priority: TaskPriority | null
  steps: string[]
}

const PRIORITY_LABEL: Record<TaskPriority, string> = { HIGH: 'prioridade alta', MEDIUM: 'prioridade média', LOW: 'prioridade baixa' }
const pad = (n: number) => String(n).padStart(2, '0')
const key = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function shouldOfferAssistant(input: string, parsed: QuickParse): boolean {
  return parsed.tokens.length === 0 && input.trim().split(/\s+/).filter(Boolean).length >= 3
}

function dateLabel(iso: string, today: Date): string {
  const [y, m, d] = iso.split('-').map(Number)
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const short = `${pad(d)}/${pad(m)}`
  if (iso === key(today)) return 'hoje'
  if (iso === key(tomorrow)) return `amanhã · ${short}`
  return y === today.getFullYear() ? short : `${short}/${y}`
}

export function fromAssistant(dto: AssistantParsedTask, today: Date): QuickParse {
  const steps = dto.steps.slice(0, MAX_STEPS)
  const tokens: QuickToken[] = []
  if (dto.dueDate) tokens.push({ kind: 'date', label: dateLabel(dto.dueDate, today) })
  if (dto.estimatedMinutes) tokens.push({ kind: 'minutes', label: `${dto.estimatedMinutes} min` })
  if (dto.priority) tokens.push({ kind: 'priority', label: PRIORITY_LABEL[dto.priority] })
  if (steps.length > 0) tokens.push({ kind: 'steps', label: `${steps.length} ${steps.length === 1 ? 'microetapa' : 'microetapas'}` })
  return { title: dto.title, dueDate: dto.dueDate, estimatedMinutes: dto.estimatedMinutes, priority: dto.priority, steps, tokens }
}

export function withoutKind(parsed: QuickParse, kind: QuickKind): QuickParse {
  const next = { ...parsed, tokens: parsed.tokens.filter((t) => t.kind !== kind) }
  if (kind === 'date') next.dueDate = null
  if (kind === 'minutes') next.estimatedMinutes = null
  if (kind === 'priority') next.priority = null
  if (kind === 'steps') next.steps = []
  return next
}
