import type { EventCategory } from '../../types/domain'
import type { ReportSummary } from './buildReport.ts'
import { CATEGORY_LABEL, LEVEL_LABEL, PRIORITY_LABEL, RELATIONSHIP_LABEL, REPORT_DISCLAIMER, fmtDateTime, fmtDay } from './buildReport.ts'

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const table = (head: string[], rows: string[][]) =>
  `<table><thead><tr>${head.map((h) => `<th>${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${escape(c)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const empty = (text: string) => `<p class="empty">${escape(text)}</p>`

export function reportHtml(r: ReportSummary): string {
  const generated = fmtDateTime(r.generatedAt)
  const sections: string[] = []

  if (r.events) {
    const cats = (Object.keys(CATEGORY_LABEL) as EventCategory[]).filter((c) => (r.events?.byCategory[c] ?? 0) > 0)
    sections.push(
      `<h2>Eventos registrados <span>${r.events.total}</span></h2>`,
      r.events.total === 0
        ? empty('Nenhum evento no período.')
        : table(
            ['Categoria', 'Quantidade'],
            [...cats.map((c) => [CATEGORY_LABEL[c], String(r.events?.byCategory[c] ?? 0)]), ['Marcados como urgentes', String(r.events.urgent)]],
          ),
    )
    if (r.events.entries?.length) {
      sections.push(
        '<h3>Registros</h3>',
        table(
          ['Data e hora', 'Categoria', 'Urgente', 'Anotação'],
          r.events.entries.map((e) => [fmtDateTime(e.occurredAt), CATEGORY_LABEL[e.category], e.urgent ? 'Sim' : 'Não', e.note ?? '']),
        ),
      )
    }
  }

  if (r.checkIns) {
    sections.push(
      `<h2>Check-ins <span>${r.checkIns.length}</span></h2>`,
      r.checkIns.length === 0
        ? empty('Nenhum check-in no período.')
        : table(['Dia', 'Como foi o dia (relato da pessoa)'], r.checkIns.map((c) => [fmtDay(c.date), LEVEL_LABEL[c.level] ?? String(c.level)])),
    )
  }

  if (r.usage) {
    sections.push(
      '<h2>Uso do aplicativo</h2>',
      table(
        ['Indicador', 'Total'],
        [
          ['Sessões do temporizador concluídas', String(r.usage.timerSessionsDone)],
          ['Sessões do temporizador encerradas antes', String(r.usage.timerSessionsCanceled)],
          ['Tarefas concluídas', String(r.usage.tasksCompleted)],
        ],
      ),
    )
  }

  if (r.tasks) {
    sections.push(
      `<h2>Tarefas <span>${plural(r.tasks.completed.length, 'concluída', 'concluídas')} · ${plural(r.tasks.pending, 'pendente', 'pendentes')}</span></h2>`,
      r.tasks.completed.length === 0
        ? empty('Nenhuma tarefa concluída no período.')
        : table(['Concluída em', 'Tarefa', 'Prioridade'], r.tasks.completed.map((t) => [fmtDateTime(t.completedAt), t.title, PRIORITY_LABEL[t.priority]])),
    )
  }

  if (sections.length === 0) sections.push(empty('A pessoa não autorizou nenhuma seção para você.'))

  const preparedFor = r.preparedFor
    ? `<p><b>Gerado para:</b> ${escape(r.preparedFor)}${r.relationship ? ` (${escape(RELATIONSHIP_LABEL[r.relationship].toLowerCase())})` : ''}</p>`
    : ''

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Relatório Kaluanã · ${escape(r.userName)}</title>
<style>
  @page { margin: 18mm 16mm; }
  body { font-family: -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif; color: #1F3556; font-size: 11pt; line-height: 1.45; }
  header { border-bottom: 3px solid #E9782D; padding-bottom: 8px; margin-bottom: 14px; }
  .brand { font-size: 9pt; letter-spacing: 2px; color: #C95D2B; font-weight: 700; }
  h1 { font-size: 20pt; margin: 2px 0 6px; }
  header p { margin: 2px 0; }
  .disclaimer { background: #F6F1EA; border-left: 3px solid #B8B0A5; padding: 8px 10px; font-size: 9.5pt; margin: 12px 0 4px; }
  h2 { font-size: 13pt; margin: 20px 0 6px; border-bottom: 1px solid #F6F1EA; padding-bottom: 3px; }
  h2 span { font-weight: 400; color: #234E70; font-size: 10.5pt; margin-left: 6px; }
  h3 { font-size: 11pt; margin: 12px 0 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th { text-align: left; font-size: 9pt; letter-spacing: .5px; text-transform: uppercase; background: #1F3556; color: #fff; padding: 5px 7px; }
  td { padding: 5px 7px; border-bottom: 1px solid #EAEAEA; vertical-align: top; }
  .empty { color: #234E70; font-style: italic; }
  footer { margin-top: 24px; font-size: 8.5pt; color: #234E70; border-top: 1px solid #EAEAEA; padding-top: 6px; }
</style>
</head>
<body>
<header>
  <div class="brand">KALUANÃ · RELATÓRIO DE ACOMPANHAMENTO</div>
  <h1>${escape(r.userName)}</h1>
  <p><b>Período:</b> últimos ${r.periodDays} dias (até ${escape(generated.slice(0, 10))})</p>
  ${preparedFor}
  <p><b>Gerado em:</b> ${escape(generated)}</p>
</header>
<div class="disclaimer">${escape(REPORT_DISCLAIMER)} Contém apenas as seções que a pessoa autorizou.</div>
${sections.join('\n')}
<footer>Documento gerado pelo aplicativo Kaluanã a partir de registros feitos pela própria pessoa. Uso restrito ao acompanhamento autorizado.</footer>
</body>
</html>`
}
