import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GUIDE_DEFINITION as def } from './guideDefinition.ts'
import { abandon, choose, interrupt, reevaluate, remainingSeconds, resume, startSession, validateDefinition } from './guideMachine.ts'

const T0 = 1_000_000

test('definição é válida: ≤3 opções, sem becos sem saída, destinos existentes', () => {
  assert.deepEqual(validateDefinition(def), [])
})

test('começa ativo no estado inicial', () => {
  const s = startSession(def, T0)
  assert.equal(s.current, 'inicio')
  assert.equal(s.status, 'ACTIVE')
})

test('opção inválida não muda o estado', () => {
  const s = startSession(def, T0)
  assert.equal(choose(def, s, 'nao-existe', T0).session.current, 'inicio')
})

test('etapa temporizada avança sozinha ao vencer o prazo', () => {
  let s = choose(def, startSession(def, T0), 'sobrecarga', T0).session
  assert.equal(s.current, 'respirar')
  assert.equal(remainingSeconds(s, T0), 60)
  s = reevaluate(def, s, T0 + 59_000)
  assert.equal(s.current, 'respirar')
  s = reevaluate(def, s, T0 + 60_000)
  assert.equal(s.current, 'depois_respirar')
})

test('reabrir o app muito depois reavalia e não perde o estado', () => {
  const s = choose(def, startSession(def, T0), 'impulso', T0).session
  const later = reevaluate(def, s, T0 + 10 * 60_000)
  assert.equal(later.current, 'depois_pausa')
  assert.equal(later.status, 'ACTIVE')
})

test('pausar congela o tempo restante e retomar recomeça dele', () => {
  let s = choose(def, startSession(def, T0), 'sobrecarga', T0).session
  s = interrupt(s, T0 + 20_000)
  assert.equal(s.status, 'INTERRUPTED')
  assert.equal(remainingSeconds(s, T0 + 999_000), 40)
  s = resume(def, s, T0 + 100_000)
  assert.equal(s.status, 'ACTIVE')
  assert.equal(remainingSeconds(s, T0 + 100_000), 40)
})

test('caminho completo chega ao estado final e conclui', () => {
  let s = startSession(def, T0)
  for (const o of ['urgencia', 'nao', 'ok']) s = choose(def, s, o, T0).session
  assert.equal(s.current, 'fim')
  assert.equal(s.status, 'COMPLETED')
  assert.deepEqual(s.history, ['inicio', 'priorizar', 'guardar', 'fim'])
})

test('opção com ação devolve a ação para a interface', () => {
  let s = startSession(def, T0)
  s = choose(def, s, 'sobrecarga', T0).session
  s = choose(def, s, 'pular', T0).session
  s = choose(def, s, 'igual', T0).session
  assert.equal(s.current, 'contato')
  assert.equal(choose(def, s, 'abrir', T0).action, 'OPEN_CONTACTS')
})

test('sessão encerrada não aceita escolhas', () => {
  const s = abandon(startSession(def, T0), T0 + 1)
  assert.equal(choose(def, s, 'sobrecarga', T0 + 2).session.current, 'inicio')
})

test('determinismo: mesma entrada, mesma saída', () => {
  const run = () => reevaluate(def, choose(def, startSession(def, T0), 'impulso', T0).session, T0 + 45_000)
  assert.deepEqual(run(), run())
})
