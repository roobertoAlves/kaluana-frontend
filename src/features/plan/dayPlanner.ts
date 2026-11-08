import type { DayPlan, DayPlanBlock, Task, TaskPriority } from '../../types/domain.ts'

export const DEFAULT_TASK_MINUTES = 25
export const BREAK_MINUTES = 5
const PRIORITY_RANK: Record<TaskPriority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

const minutesOf = (t: Task) => t.estimatedMinutes ?? DEFAULT_TASK_MINUTES

function urgency(t: Task, day: string): number {
  if (!t.dueDate || t.dueDate > day) return 2
  return t.dueDate < day ? 0 : 1
}

export function plannable(tasks: Task[], day: string): Task[] {
  return tasks.filter((t) => !t.done && (!t.dueDate || t.dueDate <= day))
}

export function order(tasks: Task[], day: string, energy: number | null): Task[] {
  const byPriority = (a: Task, b: Task) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  const shorterFirst = (a: Task, b: Task) => minutesOf(a) - minutesOf(b)

  const byEnergy = (a: Task, b: Task) => {
    if (energy !== null && energy <= 2) return shorterFirst(a, b) || byPriority(a, b)
    if (energy !== null && energy >= 4) return byPriority(a, b) || shorterFirst(b, a)
    return byPriority(a, b) || shorterFirst(a, b)
  }

  return [...tasks].sort(
    (a, b) =>
      urgency(a, day) - urgency(b, day) ||
      byEnergy(a, b) ||
      a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }) ||
      a.id.localeCompare(b.id),
  )
}

export const toMinutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`

export function layout(ordered: Task[], start: string, end: string, fixed: DayPlanBlock[] = []): Pick<DayPlan, 'blocks' | 'unscheduled'> {
  const blocks: DayPlanBlock[] = [...fixed]
  const unscheduled: DayPlan['unscheduled'] = []
  let cursor = toMinutes(start)
  const limit = toMinutes(end)

  for (const t of ordered) {
    const needsBreak = blocks.length > 0
    const minutes = minutesOf(t)
    if (cursor + minutes + (needsBreak ? BREAK_MINUTES : 0) > limit) {
      unscheduled.push({ taskId: t.id, title: t.title, minutes })
      continue
    }
    if (needsBreak) {
      blocks.push({ kind: 'BREAK', taskId: null, title: 'Pausa', start: toHHMM(cursor), end: toHHMM(cursor + BREAK_MINUTES) })
      cursor += BREAK_MINUTES
    }
    blocks.push({ kind: 'TASK', taskId: t.id, title: t.title, start: toHHMM(cursor), end: toHHMM(cursor + minutes) })
    cursor += minutes
  }
  return { blocks, unscheduled }
}

export function planLocally(tasks: Task[], day: string, energy: number | null, start: string, end: string): DayPlan {
  return {
    date: day,
    energyLevel: energy,
    source: 'RULES',
    note: null,
    windowEnd: end,
    ...layout(order(plannable(tasks, day), day, energy), start, end),
    changes: [],
  }
}

export function nextSlot(now: Date = new Date()): string {
  const m = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 5) * 5
  return toHHMM(Math.min(m, 23 * 60 + 55))
}
