import type { AccessSettings, CheckIn, EventCategory, LifeEvent } from '../../types/domain'

/**
 * Relatório informativo (RF7). Só conta e lista o que o usuário registrou.
 * Não calcula pontuações, não classifica, não sugere nada (RNF6, diretriz NICE).
 *
 * `ReportSummary` tem o mesmo formato de GET /api/reports: o app formata
 * igual o relatório vindo do servidor e o montado localmente (sem login).
 */
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

export const REPORT_DISCLAIMER =
  'Relatório informativo gerado a partir de registros feitos pelo próprio usuário. ' +
  'Não é diagnóstico, não indica prognóstico nem recomendação de tratamento.'

export interface ReportSummary {
  userName: string
  periodDays: number
  generatedAt: string
  /** true quando é a versão para o responsável/profissional (só seções autorizadas). */
  shared: boolean
  events?: { total: number; byCategory: Partial<Record<EventCategory, number>>; urgent: number }
  checkIns?: { date: string; level: number }[]
  usage?: {
    timerSessionsDone: number
    timerSessionsCanceled: number
    tasksCompleted: number
  }
}

export interface ReportInput {
  userName: string
  days: number
  events: LifeEvent[]
  checkins: CheckIn[]
  /** Se informado, inclui só as seções autorizadas (modo compartilhamento). */
  access?: AccessSettings
  now?: Date
}

/** "YYYY-MM-DD" → "DD/MM/YYYY" sem passar por Date (evita erro de fuso). */
const fmtDay = (day: string) => day.split('-').reverse().join('/')

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
    events: { total: evs.length, byCategory, urgent: evs.filter((e) => e.urgent).length },
    checkIns: checkins
      .filter((c) => new Date(c.timestamp).getTime() >= since)
      .map((c) => ({ date: c.date, level: c.level }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  }
}

/** Prévia do que o profissional verá: remove as seções não autorizadas (RF8). */
export function applyAccess(summary: ReportSummary, access: AccessSettings): ReportSummary {
  return {
    ...summary,
    shared: true,
    events: access.events ? summary.events : undefined,
    checkIns: access.checkins ? summary.checkIns : undefined,
    usage: access.usage ? summary.usage : undefined,
  }
}

export function formatReport(r: ReportSummary): string {
  const out: string[] = [
    'KALUANÃ · RELATÓRIO DE ACOMPANHAMENTO',
    `Usuário: ${r.userName}`,
    `Período: últimos ${r.periodDays} dias (até ${new Date(r.generatedAt).toLocaleDateString('pt-BR')})`,
    '',
    REPORT_DISCLAIMER,
  ]

  if (r.events) {
    out.push('', `EVENTOS REGISTRADOS (${r.events.total})`)
    for (const cat of Object.keys(CATEGORY_LABEL) as EventCategory[]) {
      const n = r.events.byCategory[cat] ?? 0
      if (n > 0) out.push(`- ${CATEGORY_LABEL[cat]}: ${n}`)
    }
    if (r.events.urgent > 0) out.push(`- Marcados como urgentes: ${r.events.urgent}`)
    if (r.events.total === 0) out.push('- Nenhum evento no período.')
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

  if (r.shared && !r.events && !r.checkIns && !r.usage) out.push('', 'O usuário não autorizou o compartilhamento de seções.')
  return out.join('\n')
}

/** Atalho para o relatório montado só com dados locais. */
export function buildReportText(input: ReportInput): string {
  const summary = summarizeLocal(input)
  return formatReport(input.access ? applyAccess(summary, input.access) : summary)
}
