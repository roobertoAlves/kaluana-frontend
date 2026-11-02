import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { DayPlan, Task } from '../../types/domain.ts'
import { planLocally } from './dayPlanner.ts'
import { describeChange, needsReplan, replanLocally, slotAfter } from './replanner.ts'

// Mesmos casos do DayReplannerTest do back-end: as duas versões precisam concordar.
const DAY = '2026-11-02'
const task = (title: string, minutes = 30, done = false): Task => ({
  id: title,
  title,
  priority: 'MEDIUM',
  estimatedMinutes: minutes,
  dueDate: null,
  done,
  completedAt: null,
  steps: [],
})

// Plano aceito às 09:00: A 09:00–09:30, pausa, B 09:35–10:05, pausa, C 10:10–10:40.
const accepted: DayPlan = planLocally([task('A'), task('B'), task('C')], DAY, null, '09:00', '12:00')
const titles = (p: DayPlan) => p.blocks.filter((b) => b.kind === 'TASK').map((b) => b.title)
const summary = (p: DayPlan) => p.changes.map((c) => [c.title, c.kind, c.from, c.to])

test('tarefa atrasada empurra o resto sem mudar a ordem', () => {
  const r = replanLocally(accepted, [task('A'), task('B'), task('C')], null, '09:42')
  assert.deepEqual(titles(r), ['B', 'A', 'C'])
  assert.equal(r.blocks[0].start, '09:35')
  assert.deepEqual(summary(r), [
    ['A', 'MOVED', '09:00', '10:10'],
    ['C', 'MOVED', '10:10', '10:45'],
  ])
})

test('tarefa concluída antes do horário adianta as seguintes', () => {
  const r = replanLocally(accepted, [task('A', 30, true), task('B'), task('C')], null, '09:12')
  assert.deepEqual(titles(r), ['B', 'C'])
  assert.equal(r.blocks[0].start, '09:15')
  assert.deepEqual(r.changes.map((c) => [c.title, c.kind]), [['A', 'DONE'], ['B', 'MOVED'], ['C', 'MOVED']])
})

test('tarefa apagada aparece como removida e a nova entra no fim', () => {
  const r = replanLocally(accepted, [task('A'), task('C'), task('Nova', 15)], null, '09:10')
  assert.deepEqual(titles(r), ['A', 'C', 'Nova'])
  assert.deepEqual(r.changes.map((c) => [c.title, c.kind]), [['B', 'REMOVED'], ['C', 'MOVED'], ['Nova', 'ADDED']])
})

test('o que não cabe mais sai do dia sem sumir', () => {
  const r = replanLocally(accepted, [task('A'), task('B'), task('C')], null, '11:20')
  assert.deepEqual(titles(r), ['A'])
  assert.deepEqual(r.unscheduled.map((u) => u.title), ['B', 'C'])
  assert.deepEqual(r.changes.map((c) => c.kind), ['MOVED', 'DROPPED', 'DROPPED'])
})

test('sem mudanças, nada a avisar', () => {
  const r = replanLocally(accepted, [task('A'), task('B'), task('C')], null, '09:20')
  assert.deepEqual(r.changes, [])
  assert.deepEqual(r.blocks, accepted.blocks)
})

test('detecta quando o plano ficou desatualizado', () => {
  const all = [task('A'), task('B'), task('C')]
  assert.equal(needsReplan(accepted, all, '09:20'), false, 'A em andamento')
  assert.equal(needsReplan(accepted, all, '09:30'), true, 'A terminou pendente')
  assert.equal(needsReplan(accepted, [task('A', 30, true), task('B'), task('C')], '09:20'), true, 'A concluída antes')
  assert.equal(needsReplan(accepted, [...all, task('Nova')], '09:20'), true, 'tarefa nova')
  assert.equal(needsReplan(accepted, [task('A', 30, true), task('B'), task('C')], '09:40'), false, 'A feita no horário')
})

test('próximo horário arredonda para 5 minutos', () => {
  assert.equal(slotAfter('09:07'), '09:10')
  assert.equal(slotAfter('09:10'), '09:10')
  assert.equal(slotAfter('23:58'), '23:55')
})

test('frases do aviso', () => {
  assert.equal(describeChange({ taskId: 'x', title: 'Ler', kind: 'MOVED', from: '09:00', to: '10:10' }), 'Ler: adiada de 09:00 para 10:10')
  assert.equal(describeChange({ taskId: 'x', title: 'Ler', kind: 'MOVED', from: '10:00', to: '09:15' }), 'Ler: adiantada de 10:00 para 09:15')
  assert.equal(describeChange({ taskId: 'x', title: 'Ler', kind: 'DROPPED', from: '10:00', to: null }), 'Ler: não cabe mais hoje')
})
