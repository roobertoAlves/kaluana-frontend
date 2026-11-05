import type { Task } from '../../types/domain.ts'

/**
 * RF17 / RNF1: revisão do fim do dia (Sunsama). Regras puras: o que foi feito
 * no dia, o que ficou pendente e como cada decisão muda a tarefa. A API aplica
 * as mesmas decisões; sem conta, elas rodam aqui.
 */

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

/** Atalho na tela inicial: das 18h em diante, enquanto o dia não foi revisado. */
export const REVIEW_FROM_HOUR = 18

const pad = (n: number) => String(n).padStart(2, '0')
const dayOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function nextDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number)
  return dayOf(new Date(y, m - 1, d + 1))
}

/** Concluídas no dia (pelo horário local de conclusão). */
export function completedOn(tasks: Task[], day: string): Task[] {
  return tasks.filter((t) => t.done && t.completedAt && dayOf(new Date(t.completedAt)) === day)
}

/** Pendentes com data até o dia: as que "eram de hoje" (ou atrasadas). */
export function pendingFor(tasks: Task[], day: string): Task[] {
  return tasks.filter((t) => !t.done && t.dueDate !== null && t.dueDate <= day)
}

export function shouldOfferReview(now: Date, lastReviewedDay: string | null): boolean {
  return now.getHours() >= REVIEW_FROM_HOUR && lastReviewedDay !== dayOf(now)
}

/** A tarefa depois da decisão (mesma regra do back-end). */
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

/** Frase do fim da revisão ("1 tarefa foi para amanhã e 1 ficou sem data."). */
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
