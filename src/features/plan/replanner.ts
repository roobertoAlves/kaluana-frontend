import type { DayPlan, DayPlanBlock, PlanChange, Task } from '../../types/domain.ts'
import { layout, order, plannable, toMinutes } from './dayPlanner.ts'

const pad = (n: number) => String(n).padStart(2, '0')
const toHHMM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

export function clock(now: Date = new Date()): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function slotAfter(hhmm: string): string {
  return toHHMM(Math.min(Math.ceil(toMinutes(hhmm) / 5) * 5, 23 * 60 + 55))
}

const isTask = (b: DayPlanBlock): b is DayPlanBlock & { taskId: string } => b.kind === 'TASK' && b.taskId !== null

export function needsReplan(plan: DayPlan, tasks: Task[], now: string): boolean {
  const pending = new Set(plannable(tasks, plan.date).map((t) => t.id))
  const known = new Set([...plan.blocks.filter(isTask).map((b) => b.taskId), ...plan.unscheduled.map((u) => u.taskId)])

  const slipped = plan.blocks.some((b) => isTask(b) && pending.has(b.taskId) && b.end <= now)
  const freed = plan.blocks.some((b) => isTask(b) && !pending.has(b.taskId) && b.end > now)
  const fresh = [...pending].some((id) => !known.has(id))
  return slipped || freed || fresh
}

export function replanLocally(previous: DayPlan, tasks: Task[], energy: number | null, now: string): DayPlan {
  const pending = order(plannable(tasks, previous.date), previous.date, energy)
  const byId = new Map(pending.map((t) => [t.id, t]))

  const running = previous.blocks.find((b) => isTask(b) && byId.has(b.taskId) && b.start <= now && now < b.end)
  const current = running ? { ...running, title: byId.get(running.taskId!)!.title } : null

  const kept: Task[] = []
  const placed = new Set<string>(current ? [current.taskId!] : [])
  for (const b of previous.blocks) {
    const task = isTask(b) ? byId.get(b.taskId) : undefined
    if (task && !placed.has(task.id)) {
      placed.add(task.id)
      kept.push(task)
    }
  }
  const ordered = [...kept, ...pending.filter((t) => !placed.has(t.id))]

  const start = current ? current.end : slotAfter(now)
  const next = layout(ordered, start, previous.windowEnd, current ? [current] : [])
  const done = new Set(tasks.filter((t) => t.done).map((t) => t.id))
  return { ...previous, energyLevel: energy, note: null, ...next, changes: changesBetween(previous.blocks, next.blocks, byId, done, now) }
}

function changesBetween(before: DayPlanBlock[], after: DayPlanBlock[], pending: Map<string, Task>, done: Set<string>, now: string): PlanChange[] {
  const newStart = new Map(after.filter(isTask).map((b) => [b.taskId, b.start]))
  const changes: PlanChange[] = []
  const seen = new Set<string>()

  for (const b of before.filter(isTask)) {
    if (seen.has(b.taskId)) continue
    seen.add(b.taskId)
    const task = pending.get(b.taskId)
    const to = newStart.get(b.taskId)
    if (!task) {
      if (b.end > now) changes.push({ taskId: b.taskId, title: b.title, kind: done.has(b.taskId) ? 'DONE' : 'REMOVED', from: b.start, to: null })
    } else if (!to) {
      changes.push({ taskId: b.taskId, title: task.title, kind: 'DROPPED', from: b.start, to: null })
    } else if (to !== b.start) {
      changes.push({ taskId: b.taskId, title: task.title, kind: 'MOVED', from: b.start, to })
    }
  }
  for (const b of after.filter(isTask)) {
    if (!seen.has(b.taskId)) changes.push({ taskId: b.taskId, title: b.title, kind: 'ADDED', from: null, to: b.start })
  }
  return changes
}

export function describeChange(c: PlanChange): string {
  switch (c.kind) {
    case 'MOVED':
      return c.to! > c.from! ? `${c.title}: adiada de ${c.from} para ${c.to}` : `${c.title}: adiantada de ${c.from} para ${c.to}`
    case 'ADDED':
      return `${c.title}: entrou no plano às ${c.to}`
    case 'DONE':
      return `${c.title}: concluída, o tempo foi liberado`
    case 'REMOVED':
      return `${c.title}: saiu do plano`
    case 'DROPPED':
      return `${c.title}: não cabe mais hoje`
  }
}
