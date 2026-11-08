export type GuideAction = 'OPEN_RELAX' | 'OPEN_SOUNDS' | 'OPEN_CONTACTS' | 'OPEN_TASKS'

export interface GuideOption {
  id: string
  label: string
  next: string
  action?: GuideAction
}

export interface GuideStep {
  id: string
  text: string
  options: GuideOption[]
  defaultOption?: string
  timeoutSec?: number
  final?: boolean
}

export interface GuideDefinition {
  id: string
  version: number
  title: string
  summary: string
  start: string
  steps: Record<string, GuideStep>
}

export type GuideStatus = 'IN_PROGRESS' | 'INTERRUPTED' | 'COMPLETED' | 'ABANDONED'

export interface GuideRun {
  guideId: string
  version: number
  stepId: string
  status: GuideStatus
  path: string[]
  startedAt: number
  stepStartedAt: number
  pausedAt: number | null
  finishedAt: number | null
}

export interface GuideSummary {
  guideId: string
  guideVersion: number
  status: 'COMPLETED' | 'ABANDONED'
  stepsCount: number
  startedAt: string
  finishedAt: string
}

export function startGuide(guide: GuideDefinition, now: number): GuideRun {
  return {
    guideId: guide.id,
    version: guide.version,
    stepId: guide.start,
    status: 'IN_PROGRESS',
    path: [guide.start],
    startedAt: now,
    stepStartedAt: now,
    pausedAt: null,
    finishedAt: null,
  }
}

export const currentStep = (guide: GuideDefinition, run: GuideRun): GuideStep => guide.steps[run.stepId]

export function chooseOption(guide: GuideDefinition, run: GuideRun, optionId: string, now: number): GuideRun {
  if (run.status !== 'IN_PROGRESS') return run
  const option = currentStep(guide, run).options.find((o) => o.id === optionId)
  if (!option) return run
  const next = guide.steps[option.next]
  return {
    ...run,
    stepId: next.id,
    path: [...run.path, next.id],
    stepStartedAt: now,
    status: next.final ? 'COMPLETED' : 'IN_PROGRESS',
    finishedAt: next.final ? now : null,
  }
}

export function secondsLeft(guide: GuideDefinition, run: GuideRun, now: number): number | null {
  const step = currentStep(guide, run)
  if (!step.timeoutSec || run.status === 'COMPLETED' || run.status === 'ABANDONED') return null
  const reference = run.status === 'INTERRUPTED' && run.pausedAt !== null ? run.pausedAt : now
  return Math.max(0, Math.ceil(step.timeoutSec - (reference - run.stepStartedAt) / 1000))
}

export function tickGuide(guide: GuideDefinition, run: GuideRun, now: number): GuideRun {
  if (run.status !== 'IN_PROGRESS') return run
  const step = currentStep(guide, run)
  if (!step.timeoutSec || !step.defaultOption) return run
  if (now - run.stepStartedAt < step.timeoutSec * 1000) return run
  return chooseOption(guide, run, step.defaultOption, now)
}

export function pauseGuide(run: GuideRun, now: number): GuideRun {
  return run.status === 'IN_PROGRESS' ? { ...run, status: 'INTERRUPTED', pausedAt: now } : run
}

export function resumeGuide(run: GuideRun, now: number): GuideRun {
  if (run.status !== 'INTERRUPTED' || run.pausedAt === null) return run
  return {
    ...run,
    status: 'IN_PROGRESS',
    stepStartedAt: run.stepStartedAt + (now - run.pausedAt),
    pausedAt: null,
  }
}

export function abandonGuide(run: GuideRun, now: number): GuideRun {
  if (run.status === 'COMPLETED' || run.status === 'ABANDONED') return run
  return { ...run, status: 'ABANDONED', finishedAt: now, pausedAt: null }
}

export function summarize(run: GuideRun): GuideSummary | null {
  if ((run.status !== 'COMPLETED' && run.status !== 'ABANDONED') || run.finishedAt === null) return null
  return {
    guideId: run.guideId,
    guideVersion: run.version,
    status: run.status,
    stepsCount: run.path.length - 1,
    startedAt: new Date(run.startedAt).toISOString(),
    finishedAt: new Date(run.finishedAt).toISOString(),
  }
}

export function orderOptions(step: GuideStep, order: number[] | null | undefined): GuideOption[] {
  const n = step.options.length
  const valid = !!order && order.length === n && new Set(order).size === n && order.every((i) => Number.isInteger(i) && i >= 0 && i < n)
  return valid ? order.map((i) => step.options[i]) : step.options
}

export function validateGuide(guide: GuideDefinition): string[] {
  const errors: string[] = []
  const ids = Object.keys(guide.steps)
  if (!guide.steps[guide.start]) errors.push(`etapa inicial "${guide.start}" não existe`)
  for (const id of ids) {
    const step = guide.steps[id]
    if (step.id !== id) errors.push(`etapa "${id}" com id diferente`)
    if (step.final) continue
    if (step.options.length < 2 || step.options.length > 3) errors.push(`etapa "${id}" precisa de 2 ou 3 opções`)
    for (const o of step.options) if (!guide.steps[o.next]) errors.push(`opção "${o.id}" leva a etapa inexistente "${o.next}"`)
    if (step.timeoutSec && !step.options.some((o) => o.id === step.defaultOption)) errors.push(`etapa "${id}" tem prazo sem opção padrão válida`)
  }
  const reachesFinal = new Set(ids.filter((id) => guide.steps[id].final))
  let changed = true
  while (changed) {
    changed = false
    for (const id of ids) {
      if (reachesFinal.has(id)) continue
      if (guide.steps[id].options.some((o) => reachesFinal.has(o.next))) {
        reachesFinal.add(id)
        changed = true
      }
    }
  }
  for (const id of ids) if (!reachesFinal.has(id)) errors.push(`etapa "${id}" não chega a um fim`)
  return errors
}
