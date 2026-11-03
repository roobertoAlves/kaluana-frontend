import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { ReportSummary } from './buildReport.ts'
import { applyAccess, formatReport } from './buildReport.ts'
import { reportHtml } from './reportHtml.ts'

const full: ReportSummary = {
  userName: 'Maria <script>',
  periodDays: 7,
  generatedAt: '2026-11-03T15:00:00.000Z',
  shared: false,
  events: {
    total: 1,
    byCategory: { SOBRECARGA: 1 },
    urgent: 1,
    entries: [{ occurredAt: '2026-11-02T13:00:00.000Z', category: 'SOBRECARGA', urgent: true, note: 'Barulho & luz' }],
  },
  checkIns: [{ date: '2026-11-02', level: 2 }],
  usage: { timerSessionsDone: 3, timerSessionsCanceled: 1, tasksCompleted: 2 },
  tasks: { pending: 4, completed: [{ title: 'Estudar', priority: 'HIGH', completedAt: '2026-11-02T18:00:00.000Z' }] },
}

test('versão compartilhada só leva as seções autorizadas', () => {
  const shared = applyAccess(full, { events: false, checkins: true, usage: false, tasks: true }, 'Dra. Ana')
  const html = reportHtml({ ...shared, relationship: 'HEALTH_PROFESSIONAL' })
  assert.match(html, /Check-ins/)
  assert.match(html, /Estudar/)
  assert.match(html, /Gerado para:<\/b> Dra\. Ana \(profissional de saúde\)/)
  assert.doesNotMatch(html, /Eventos registrados/)
  assert.doesNotMatch(html, /Uso do aplicativo/)
})

test('texto vindo da pessoa é escapado no HTML', () => {
  const html = reportHtml(full)
  assert.match(html, /Maria &lt;script&gt;/)
  assert.match(html, /Barulho &amp; luz/)
  assert.doesNotMatch(html, /<script>/)
})

test('sem nenhuma seção autorizada, avisa em vez de ficar vazio', () => {
  const none = applyAccess(full, { events: false, checkins: false, usage: false })
  assert.match(reportHtml(none), /não autorizou nenhuma seção/)
  assert.match(formatReport(none), /não autorizou o compartilhamento/)
})

test('texto do relatório traz os registros detalhados', () => {
  const text = formatReport(full)
  assert.match(text, /Sobrecarga · urgente · "Barulho & luz"/)
  assert.match(text, /TAREFAS CONCLUÍDAS \(1\)/)
  assert.match(text, /Pendentes agora: 4/)
})
