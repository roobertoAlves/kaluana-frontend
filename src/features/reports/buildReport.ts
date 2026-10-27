import type { AccessSettings, CheckIn, EventCategory, LifeEvent } from '../../types/domain'

/**
 * Relatório informativo (RF7). Só conta e lista o que o usuário registrou.
 * Não calcula pontuações, não classifica, não sugere nada (RNF6, diretriz NICE).
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

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export interface ReportInput {
  userName: string
  days: number
  events: LifeEvent[]
  checkins: CheckIn[]
  /** Se informado, inclui só as seções autorizadas (modo compartilhamento). */
  access?: AccessSettings
  now?: Date
}

export function buildReportText({ userName, days, events, checkins, access, now = new Date() }: ReportInput): string {
  const since = now.getTime() - days * 24 * 60 * 60_000
  const evs = events.filter((e) => new Date(e.timestamp).getTime() >= since)
  const cis = checkins.filter((c) => new Date(c.timestamp).getTime() >= since)
  const out: string[] = [
    'KALUANÃ · RELATÓRIO DE ACOMPANHAMENTO',
    `Usuário: ${userName}`,
    `Período: últimos ${days} dias (até ${now.toLocaleDateString('pt-BR')})`,
    '',
    REPORT_DISCLAIMER,
  ]

  if (!access || access.events) {
    out.push('', `EVENTOS REGISTRADOS (${evs.length})`)
    for (const cat of Object.keys(CATEGORY_LABEL) as EventCategory[]) {
      const n = evs.filter((e) => e.category === cat).length
      if (n > 0) out.push(`- ${CATEGORY_LABEL[cat]}: ${n}`)
    }
    const urgent = evs.filter((e) => e.urgent).length
    if (urgent > 0) out.push(`- Marcados como urgentes: ${urgent}`)
    if (evs.length === 0) out.push('- Nenhum evento no período.')
  }

  if (!access || access.checkins) {
    out.push('', `CHECK-INS (${cis.length})`)
    for (const c of [...cis].sort((a, b) => a.date.localeCompare(b.date))) out.push(`- ${fmtDate(c.timestamp)}: ${LEVEL_LABEL[c.level]}`)
    if (cis.length === 0) out.push('- Nenhum check-in no período.')
  }

  if (access && !access.events && !access.checkins) out.push('', 'O usuário não autorizou o compartilhamento de seções.')
  return out.join('\n')
}
