import { test } from 'node:test'
import assert from 'node:assert/strict'
import { breath, remainingLabel, sleepVolume, suggestSound } from './soundscape.ts'

test('sugestão pelo período do dia', () => {
  assert.equal(suggestSound(new Date(2026, 10, 2, 7, 0)).sound, 'FOREST')
  assert.equal(suggestSound(new Date(2026, 10, 2, 11, 59)).sound, 'FOREST')
  assert.equal(suggestSound(new Date(2026, 10, 2, 12, 0)).sound, 'RAIN')
  assert.equal(suggestSound(new Date(2026, 10, 2, 18, 0)).sound, 'WAVES')
  assert.equal(suggestSound(new Date(2026, 10, 2, 3, 0)).period, 'noite')
})

test('respiração: 4 s inspirando e 6 s soltando, em ciclo', () => {
  assert.deepEqual(breath(0), { phase: 'in', secondsLeft: 4 })
  assert.deepEqual(breath(3500), { phase: 'in', secondsLeft: 1 })
  assert.deepEqual(breath(4000), { phase: 'out', secondsLeft: 6 })
  assert.deepEqual(breath(9999), { phase: 'out', secondsLeft: 1 })
  assert.deepEqual(breath(10000), { phase: 'in', secondsLeft: 4 })
})

test('dormir: volume estável na primeira metade e chega a zero no fim', () => {
  const total = 30 * 60000
  assert.equal(sleepVolume(0, total), 0.6)
  assert.equal(sleepVolume(total / 2, total), 0.6)
  assert.equal(sleepVolume(total * 0.75, total), 0.3)
  assert.equal(sleepVolume(total, total), 0)
  assert.equal(sleepVolume(total + 1000, total), 0)
})

test('tempo restante', () => {
  assert.equal(remainingLabel(462000), '7:42')
  assert.equal(remainingLabel(-5), '0:00')
})
