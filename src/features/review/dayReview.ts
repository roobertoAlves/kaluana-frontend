import type { Task } from '../../types/domain.ts'



export type ReviewAction = 'TOMORROW' | 'NO_DATE' | 'DONE'
export type DayFeeling = 'HARD' | 'OK' | 'GOOD'

export interface ReviewMove {
  taskId: string
  action: ReviewAction
}

export const FEELINGS: { value: DayFeeling; label: string }[] = [
  { value: 'HARD', label: 'Difícil' },
  { value: 'OK', label: 'Ok' },
  { value: 'GOOD', label: 'Bom' },
]

export const ACTIONS: { value: ReviewAction; label: string }[] = [
  { value: 'TOMORROW', label: 'Amanhã' },
  { value: 'NO_DATE', label: 'Sem data' },
  { value: 'DONE', label: 'Concluí' },
]


export const REVIEW_FROM_HOUR = 18

const pad = (n: number) => String(n).padStart(2, '0')
const dayOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function nextDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return dayOf(new Date(y, m - 1, d + 1))
}


export function completedOn(tasks: Task[], day: string): Task[] {
  return tasks.filter((t) => t.done && t.completedAt && dayOf(new Date(t.completedAt)) === day)
}


export function pendingFor(tasks: Task[], day: string): Task[] {
  return tasks.filter((t) => !t.done && t.dueDate !== null && t.dueDate <= day)
}

export function shouldOfferReview(now: Date, lastReviewedDay: string | null): boolean {
  return now.getHours() >= REVIEW_FROM_HOUR && lastReviewedDay !== dayOf(now)
}


export function applyMove(task: Task, action: ReviewAction, day: string, now: Date = new Date()): Task {
  switch (action) {
    case 'TOMORROW':
      return { ...task, dueDate: nextDay(day) }
    case 'NO_DATE':
      return { ...task, dueDate: null }
    case 'DONE':
      return { ...task, done: true, completedAt: now.toISOString() }
  }
}


export function summaryLine(moves: ReviewMove[]): string {
  const count = (a: ReviewAction) => moves.filter((m) => m.action === a).length
  const parts: string[] = []
  const t = count('TOMORROW')
  const n = count('NO_DATE')
  const d = count('DONE')
  if (t) parts.push(`${t} ${t === 1 ? 'tarefa foi' : 'tarefas foram'} para amanhã`)
  if (n) parts.push(`${n} ${n === 1 ? 'ficou' : 'ficaram'} sem data`)
  if (d) parts.push(`${d} ${d === 1 ? 'foi marcada' : 'foram marcadas'} como concluída${d === 1 ? '' : 's'}`)
  if (parts.length === 0) return 'Nada foi mudado nas tarefas.'
  const text = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}`
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`
}
