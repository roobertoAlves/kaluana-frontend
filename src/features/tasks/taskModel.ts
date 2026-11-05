import type { Task, TaskPriority } from '../../types/domain.ts'

export const MAX_STEPS = 12
export const PRIORITY_LABEL: Record<TaskPriority, string> = { HIGH: 'Alta', MEDIUM: 'Média', LOW: 'Baixa' }
const PRIORITY_RANK: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

export function stepProgress(task: Task): number {
  if (task.steps.length === 0) return task.done ? 1 : 0
  return task.steps.filter((s) => s.done).length / task.steps.length
}

export function sortForList(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    const da = a.dueDate ?? '9999-12-31'
    const db = b.dueDate ?? '9999-12-31'
    if (da !== db) return da.localeCompare(db)
    return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  })
}

export function focusSteps(task: Task): string[] {
  return task.steps
    .filter((s) => !s.done)
    .slice(0, 4)
    .map((s) => (s.text.length > 40 ? `${s.text.slice(0, 39)}…` : s.text))
}

export function withStepAdded(task: Task, text: string, id: string): Task {
  if (task.steps.length >= MAX_STEPS) return task
  return { ...task, steps: [...task.steps, { id, text: text.trim(), done: false }] }
}

export function withStepToggled(task: Task, stepId: string): Task {
  return { ...task, steps: task.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)) }
}

export function withStepRemoved(task: Task, stepId: string): Task {
  return { ...task, steps: task.steps.filter((s) => s.id !== stepId) }
}

export function withDone(task: Task, done: boolean, now: Date = new Date()): Task {
  return { ...task, done, completedAt: done ? now.toISOString() : null }
}

export function taskMeta(task: Task, today: string): string {
  const parts: string[] = []
  if (task.estimatedMinutes) parts.push(`${task.estimatedMinutes} min`)
  parts.push(`prioridade ${PRIORITY_LABEL[task.priority].toLowerCase()}`)
  if (task.dueDate) {
    if (task.dueDate < today) parts.push('atrasada')
    else if (task.dueDate === today) parts.push('hoje')
    else parts.push(task.dueDate.split('-').reverse().slice(0, 2).join('/'))
  }
  return parts.join(' · ')
}

export type TaskGroupKey = 'overdue' | 'today' | 'upcoming' | 'noDate' | 'done'

export const GROUP_TITLE: Record<TaskGroupKey, string> = {
  overdue: 'ATRASADAS',
  today: 'HOJE',
  upcoming: 'PRÓXIMAS',
  noDate: 'SEM DATA',
  done: 'CONCLUÍDAS',
}

export function groupTasks(tasks: Task[], today: string): { key: TaskGroupKey; tasks: Task[] }[] {
  const keyOf = (t: Task): TaskGroupKey => {
    if (t.done) return 'done'
    if (!t.dueDate) return 'noDate'
    if (t.dueDate < today) return 'overdue'
    return t.dueDate === today ? 'today' : 'upcoming'
  }
  const order: TaskGroupKey[] = ['overdue', 'today', 'upcoming', 'noDate', 'done']
  const sorted = sortForList(tasks)
  return order.map((key) => ({ key, tasks: sorted.filter((t) => keyOf(t) === key) })).filter((g) => g.tasks.length > 0)
}

export function doneConfirmation(task: Task): string {
  const open = task.steps.filter((s) => !s.done).length
  if (open === 0) return 'Ela sai da lista de pendentes. Dá para desfazer em "Concluídas".'
  return `Ainda ${open === 1 ? 'falta 1 microetapa' : `faltam ${open} microetapas`}. Concluir mesmo assim?`
}
