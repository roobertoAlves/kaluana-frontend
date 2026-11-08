import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { AccessLogEntry } from './accessLog.ts'
import { describeAccess, groupAccessByDay } from './accessLog.ts'

const entry = (at: Date, action: AccessLogEntry['action'] = 'VIEW_REPORT', periodDays = 30): AccessLogEntry => ({
  viewerId: 'v1',
  viewerName: 'Dra. Ana',
  action,
  periodDays,
  at: at.toISOString(),
})

test('descreve o que a pessoa fez e o período', () => {
  const now = new Date(2026, 10, 8, 10, 0)
  assert.equal(describeAccess(entry(now)), 'viu o relatório (últimos 30 dias)')
  assert.equal(describeAccess(entry(now, 'EXPORT_PDF', 1)), 'exportou o relatório em PDF (último dia)')
})

test('agrupa por dia, do mais recente para o mais antigo', () => {
  const now = new Date(2026, 10, 8, 18, 0)
  const groups = groupAccessByDay(
    [
      entry(new Date(2026, 10, 6, 9, 0)),
      entry(new Date(2026, 10, 8, 9, 0)),
      entry(new Date(2026, 10, 7, 20, 0), 'EXPORT_PDF'),
      entry(new Date(2026, 10, 8, 15, 0)),
    ],
    now,
  )
  assert.deepEqual(
    groups.map((g) => g.title),
    ['Hoje', 'Ontem', '06/11/2026'],
  )
  assert.equal(groups[0].entries.length, 2)
  assert.ok(groups[0].entries[0].at > groups[0].entries[1].at)
})

test('sem registros, nenhum grupo', () => {
  assert.deepEqual(groupAccessByDay([]), [])
})
