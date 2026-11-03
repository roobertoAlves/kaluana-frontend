import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Reminder } from '../../types/domain.ts'
import { describeReminder, fireLabel, groupReminders, nextFireTime } from './reminderModel.ts'

const base: Reminder = { id: 'r1', title: 'Beber água', time: '08:30', leadMinutes: 10, frequency: 'DAILY', insistence: 'MEDIUM', enabled: true }
const now = new Date(2026, 10, 3, 9, 0)

test('próximo aviso já passou hoje: vai para amanhã', () => {
  const at = nextFireTime('08:30', 10, now)
  assert.equal(at.getDate(), 4)
  assert.equal(at.getHours(), 8)
  assert.equal(at.getMinutes(), 20)
  assert.equal(fireLabel(at, now), 'amanhã às 08:20')
})

test('aviso ainda hoje', () => {
  assert.equal(fireLabel(nextFireTime('18:00', 0, now), now), 'hoje às 18:00')
})

test('descreve frequência, antecedência e insistência', () => {
  assert.equal(describeReminder(base), 'Todo dia · avisa 10 min antes · insistência média')
  assert.equal(describeReminder({ ...base, leadMinutes: 0, frequency: 'ONCE', insistence: 'HIGH' }), 'Uma vez · avisa na hora · insistência alta')
})

test('ativos em ordem do próximo aviso; pausados à parte', () => {
  const g = groupReminders(
    [
      base,
      { ...base, id: 'r2', time: '12:00' },
      { ...base, id: 'r3', time: '07:00', enabled: false },
    ],
    now,
  )
  assert.deepEqual(g.active.map((a) => a.reminder.id), ['r2', 'r1'])
  assert.deepEqual(g.paused.map((r) => r.id), ['r3'])
})
