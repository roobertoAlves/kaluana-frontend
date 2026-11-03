import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MINUTE, setMuted, soundPlaying, addMinute, cancelTimer, currentStep, pauseTimer, progress, reevaluateTimer, remainingMs, resumeTimer, startTimer, formatClock } from './timerSession.ts'

const T0 = 5_000_000
const mk = (steps: string[] = []) => startTimer('a', { task: 'Estudar', minutes: 25, steps, water: false }, T0)

test('começa rodando com o tempo total', () => {
  const s = mk()
  assert.equal(s.status, 'RUNNING')
  assert.equal(remainingMs(s, T0), 25 * MINUTE)
})

test('pausar congela e retomar continua do mesmo ponto', () => {
  let s = pauseTimer(mk(), T0 + 5 * MINUTE)
  assert.equal(remainingMs(s, T0 + 99 * MINUTE), 20 * MINUTE)
  s = resumeTimer(s, T0 + 30 * MINUTE)
  assert.equal(remainingMs(s, T0 + 30 * MINUTE), 20 * MINUTE)
})

test('+1 min vale rodando e pausado', () => {
  assert.equal(remainingMs(addMinute(mk(), T0), T0), 26 * MINUTE)
  assert.equal(remainingMs(addMinute(pauseTimer(mk(), T0), T0), T0), 26 * MINUTE)
})

test('conclui sozinho ao vencer o prazo, mesmo reaberto depois', () => {
  const s = reevaluateTimer(mk(), T0 + 3 * 60 * MINUTE)
  assert.equal(s.status, 'DONE')
  assert.equal(s.finishedAt, T0 + 25 * MINUTE)
})

test('não conclui antes do prazo', () => {
  assert.equal(reevaluateTimer(mk(), T0 + 24 * MINUTE).status, 'RUNNING')
})

test('etapas dividem o tempo igualmente', () => {
  const s = mk(['a', 'b', 'c', 'd'])
  assert.equal(currentStep(s, T0), 0)
  assert.equal(currentStep(s, T0 + 7 * MINUTE), 1)
  assert.equal(currentStep(s, T0 + 24 * MINUTE), 3)
})

test('progresso e relógio', () => {
  assert.ok(Math.abs(progress(mk(), T0 + 5 * MINUTE) - 0.2) < 1e-9)
  assert.equal(formatClock(61_000), '01:01')
})

test('cancelar encerra e não volta a rodar', () => {
  const s = cancelTimer(mk(), T0 + 1)
  assert.equal(s.status, 'CANCELED')
  assert.equal(resumeTimer(s, T0 + 2).status, 'CANCELED')
})

test('sessão sem som e sem tarefa por padrão; guarda os escolhidos', () => {
  const plain = mk()
  assert.equal(plain.sound, 'NONE')
  assert.equal(plain.taskId, null)
  const withSound = startTimer('b', { task: 'Ler', minutes: 10, steps: [], water: false, sound: 'BROWN', taskId: 't1' }, T0)
  assert.equal(withSound.sound, 'BROWN')
  assert.equal(withSound.taskId, 't1')
})

test('silenciar vale para a sessão inteira e não mexe no tempo', () => {
  const s = startTimer('a', { task: 'Ler', minutes: 25, steps: [], water: false, sound: 'BROWN' }, T0)
  assert.equal(soundPlaying(s), true)
  const m = setMuted(s, true)
  assert.equal(soundPlaying(m), false)
  assert.equal(remainingMs(m, T0 + MINUTE), remainingMs(s, T0 + MINUTE))
  assert.equal(soundPlaying(pauseTimer(setMuted(m, false), T0)), false, 'pausada não toca')
  assert.equal(soundPlaying(null), false)
})
