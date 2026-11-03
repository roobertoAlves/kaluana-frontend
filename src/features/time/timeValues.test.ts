import { test } from 'node:test'
import assert from 'node:assert/strict'
import { clampMinutes, dateWithTime, dayLabel, durationLabel, formatDay, parseDay, parseTime, timeOfDate, wheelRange } from './timeValues.ts'

test('horário: lê, formata e ignora valor inválido', () => {
  assert.deepEqual(parseTime('07:05'), { hour: 7, minute: 5 })
  assert.deepEqual(parseTime('9:30'), { hour: 9, minute: 30 })
  assert.deepEqual(parseTime('abc'), { hour: 0, minute: 0 })
  assert.equal(timeOfDate(dateWithTime('21:45', new Date(2026, 10, 2))), '21:45')
})

test('dia: ida e volta e rótulos curtos', () => {
  const today = new Date(2026, 10, 2)
  assert.equal(formatDay(parseDay('2026-11-04')), '2026-11-04')
  assert.equal(dayLabel('2026-11-02', today), 'hoje')
  assert.equal(dayLabel('2026-11-03', today), 'amanhã')
  assert.equal(dayLabel('2026-11-04', today), 'quarta, 4 nov')
})

test('duração', () => {
  assert.equal(durationLabel(25), '25 min')
  assert.equal(durationLabel(60), '1 h')
  assert.equal(durationLabel(95), '1 h 35 min')
  assert.equal(clampMinutes(0, 1, 600), 1)
  assert.equal(clampMinutes(700, 1, 600), 600)
  assert.deepEqual(wheelRange(10, 5), [0, 5, 10])
})
