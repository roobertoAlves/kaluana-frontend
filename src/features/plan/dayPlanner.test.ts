import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Task } from '../../types/domain.ts'
import { layout, nextSlot, order, planLocally } from './dayPlanner.ts'

// Mesmos casos do DayPlannerTest do back-end: as duas versões precisam concordar.
const DAY = '2026-11-02'
const task = (title: string, priority: Task['priority'], minutes: number | null, dueDate: string | null = null): Task => ({
  id: title,
  title,
  priority,
  estimatedMinutes: minutes,
  dueDate,
  done: false,
  completedAt: null,
  steps: [],
})

test('atrasadas e do dia vêm antes', () => {
  const r = order([task('Sem data', 'HIGH', 30), task('Do dia', 'LOW', 30, DAY), task('Atrasada', 'LOW', 30, '2026-10-31')], DAY, null)
  assert.deepEqual(r.map((t) => t.title), ['Atrasada', 'Do dia', 'Sem data'])
})

test('energia baixa começa pelas curtas', () => {
  const r = order([task('Longa', 'HIGH', 90), task('Curta', 'LOW', 10)], DAY, 1)
  assert.deepEqual(r.map((t) => t.title), ['Curta', 'Longa'])
})

test('energia alta prioriza importantes e longas', () => {
  const r = order([task('Baixa', 'LOW', 60), task('Curta alta', 'HIGH', 10), task('Longa alta', 'HIGH', 90)], DAY, 5)
  assert.deepEqual(r.map((t) => t.title), ['Longa alta', 'Curta alta', 'Baixa'])
})

test('insere pausas e usa 25 min quando não há duração', () => {
  const { blocks, unscheduled } = layout([task('Primeira', 'MEDIUM', 30), task('Sem duração', 'MEDIUM', null)], '09:00', '12:00')
  assert.deepEqual(blocks.map((b) => b.kind), ['TASK', 'BREAK', 'TASK'])
  assert.equal(blocks[2].start, '09:35')
  assert.equal(blocks[2].end, '10:00')
  assert.equal(unscheduled.length, 0)
})

test('o que não cabe vai para a lista, sem descartar menores', () => {
  const { blocks, unscheduled } = layout([task('Grande', 'HIGH', 120), task('Pequena', 'LOW', 20)], '21:00', '22:00')
  assert.deepEqual(unscheduled.map((u) => u.title), ['Grande'])
  assert.deepEqual(blocks.map((b) => b.title), ['Pequena'])
})

test('plano local ignora concluídas e tarefas de outros dias', () => {
  const done = { ...task('Feita', 'HIGH', 10), done: true }
  const plan = planLocally([done, task('Futura', 'HIGH', 10, '2026-11-09'), task('Hoje', 'LOW', 10, DAY)], DAY, null, '09:00', '10:00')
  assert.deepEqual(plan.blocks.map((b) => b.title), ['Hoje'])
})

test('próximo horário arredonda para 5 minutos', () => {
  assert.equal(nextSlot(new Date(2026, 10, 2, 9, 7)), '09:10')
  assert.equal(nextSlot(new Date(2026, 10, 2, 9, 10)), '09:10')
})
