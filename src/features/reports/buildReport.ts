import type { CheckIn, EventCategory, LifeEvent, LinkRelationship, TaskPriority } from '../../types/domain'

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  SOCIAL: 'Social',
  IMPULSIVIDADE: 'Impulsividade',
  URGENCIA: 'Urgência',
  SOBRECARGA: 'Sobrecarga',
}

export const LEVEL_LABEL: Record<number, string> = {
  1: '1 · Dia muito difícil',
  2: '2 · Dia difícil',
  3: '3 · Dia neutro',
  4: '4 · Dia tranquilo',
  5: '5 · Dia muito tranquilo',
}

export const RELATIONSHIP_LABEL: Record<LinkRelationship, string> = {
  FAMILY: 'Familiar',
  HEALTH_PROFESSIONAL: 'Profissional de saúde',
  OTHER: 'Outro',
}

export const PRIORITY_LABEL: Record<TaskPriority, string> = { LOW: 'baixa', MEDIUM: 'média', HIGH: 'alta' }

export const REPORT_DISCLAIMER =
  'Relatório informativo gerado a partir de registros feitos pelo próprio usuário. ' +
  'Não é diagnóstico, não indica prognóstico nem recomendação de tratamento.'

export interface ReportEventEntry {
  occurredAt: string
  category: EventCategory
  urgent: boolean
  note?: string | null
}

export interface ReportTaskEntry {
  title: string
  priority: TaskPriority
  completedAt: string
}

export interface ReportSummary {
  userName: string
  periodDays: number
  generatedAt: string
  shared: boolean
  preparedFor?: string
  relationship?: LinkRelationship
  events?: { total: number; byCategory: Partial<Record<EventCategory, number>>; urgent: number; entries?: ReportEventEntry[] }
  checkIns?: { date: string; level: number }[]
  usage?: {
    timerSessionsDone: number
    timerSessionsCanceled: number
    tasksCompleted: number
  }
  tasks?: { pending: number; completed: ReportTaskEntry[] }
}

export interface ReportScope {
  events: boolean
  checkins: boolean
  usage: boolean
  tasks?: boolean
}

export interface ReportInput {
  userName: string
  days: number
  events: LifeEvent[]
  checkins: CheckIn[]
  now?: Date
}

export const fmtDay = (day: string) => day.split('-').reverse().join('/')

export function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function summarizeLocal({ userName, days, events, checkins, now = new Date() }: ReportInput): ReportSummary {
  const since = now.getTime() - days * 24 * 60 * 60_000
  const evs = events.filter((e) => new Date(e.timestamp).getTime() >= since)
  const byCategory: Partial<Record<EventCategory, number>> = {}
  for (const e of evs) byCategory[e.category] = (byCategory[e.category] ?? 0) + 1

  return {
    userName,
    periodDays: days,
    generatedAt: now.toISOString(),
    shared: false,
    events: {
      total: evs.length,
      byCategory,
      urgent: evs.filter((e) => e.urgent).length,
      entries: evs
        .map((e) => ({ occurredAt: e.timestamp, category: e.category, urgent: e.urgent, note: e.text }))
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
    },
    checkIns: checkins
      .filter((c) => new Date(c.timestamp).getTime() >= since)
      .map((c) => ({ date: c.date, level: c.level }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

export function applyAccess(summary: ReportSummary, scope: ReportScope, preparedFor?: string): ReportSummary {
  return {
    ...summary,
    shared: true,
    preparedFor,
    events: scope.events ? summary.events : undefined,
    checkIns: scope.checkins ? summary.checkIns : undefined,
    usage: scope.usage ? summary.usage : undefined,
    tasks: scope.tasks ? summary.tasks : undefined,
  }
}

const hasSections = (r: ReportSummary) => !!(r.events || r.checkIns || r.usage || r.tasks)

export function formatReport(r: ReportSummary): string {
  const out: string[] = [
    'KALUANÃ · RELATÓRIO DE ACOMPANHAMENTO',
    `Usuário: ${r.userName}`,
    `Período: últimos ${r.periodDays} dias (até ${new Date(r.generatedAt).toLocaleDateString('pt-BR')})`,
  ]
  if (r.preparedFor) out.push(`Gerado para: ${r.preparedFor}${r.relationship ? ` (${RELATIONSHIP_LABEL[r.relationship].toLowerCase()})` : ''}`)
  out.push('', REPORT_DISCLAIMER)

  if (r.events) {
    out.push('', `EVENTOS REGISTRADOS (${r.events.total})`)
    for (const cat of Object.keys(CATEGORY_LABEL) as EventCategory[]) {
      const n = r.events.byCategory[cat] ?? 0
      if (n > 0) out.push(`- ${CATEGORY_LABEL[cat]}: ${n}`)
    }
    if (r.events.urgent > 0) out.push(`- Marcados como urgentes: ${r.events.urgent}`)
    if (r.events.total === 0) out.push('- Nenhum evento no período.')
    for (const e of r.events.entries ?? []) {
      out.push(`  ${fmtDateTime(e.occurredAt)} · ${CATEGORY_LABEL[e.category]}${e.urgent ? ' · urgente' : ''}${e.note ? ` · "${e.note}"` : ''}`)
    }
  }

  if (r.checkIns) {
    out.push('', `CHECK-INS (${r.checkIns.length})`)
    for (const c of r.checkIns) out.push(`- ${fmtDay(c.date)}: ${LEVEL_LABEL[c.level]}`)
    if (r.checkIns.length === 0) out.push('- Nenhum check-in no período.')
  }

  if (r.usage) {
    const u = r.usage
    out.push(
      '',
      'USO DO APLICATIVO',
      `- Sessões do temporizador concluídas: ${u.timerSessionsDone}`,
      `- Sessões do temporizador encerradas antes: ${u.timerSessionsCanceled}`,
      `- Tarefas concluídas: ${u.tasksCompleted}`,
    )
  }

  if (r.tasks) {
    out.push('', `TAREFAS CONCLUÍDAS (${r.tasks.completed.length})`, `- Pendentes agora: ${r.tasks.pending}`)
    for (const t of r.tasks.completed) out.push(`- ${fmtDateTime(t.completedAt)} · ${t.title} (prioridade ${PRIORITY_LABEL[t.priority]})`)
  }

  if (r.shared && !hasSections(r)) out.push('', 'O usuário não autorizou o compartilhamento de seções.')
  return out.join('\n')
}

export function buildReportText(input: ReportInput): string {
  return formatReport(summarizeLocal(input))
}
