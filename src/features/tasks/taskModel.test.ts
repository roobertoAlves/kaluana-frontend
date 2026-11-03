import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Task } from '../../types/domain.ts'
import { MAX_STEPS, focusSteps, sortForList, stepProgress, taskMeta, withDone, withStepAdded, withStepToggled, groupTasks, doneConfirmation } from './taskModel.ts'

const base: Task = {
  id: 't1',
  title: 'Estudar',
  priority: 'MEDIUM',
  estimatedMinutes: 30,
  dueDate: null,
  done: false,
  completedAt: null,
  steps: [],
}

test('progresso conta as microetapas concluídas', () => {
  let t = withStepAdded(base, 'Abrir o livro', 's1')
  t = withStepAdded(t, 'Ler 5 páginas', 's2')
  t = withStepToggled(t, 's1')
  assert.equal(stepProgress(t), 0.5)
})

test('não passa do limite de microetapas', () => {
  let t = base
  for (let i = 0; i < MAX_STEPS + 3; i++) t = withStepAdded(t, `etapa ${i}`, `s${i}`)
  assert.equal(t.steps.length, MAX_STEPS)
})

test('ordena pendentes antes, por data e prioridade', () => {
  const tasks: Task[] = [
    { ...base, id: 'feita', done: true },
    { ...base, id: 'sem-data-alta', priority: 'HIGH' },
    { ...base, id: 'amanha', dueDate: '2026-11-03' },
    { ...base, id: 'hoje', dueDate: '2026-11-02' },
  ]
  assert.deepEqual(sortForList(tasks).map((t) => t.id), ['hoje', 'amanha', 'sem-data-alta', 'feita'])
})

test('foco usa só etapas pendentes, até 4, encurtadas', () => {
  let t = base
  for (let i = 0; i < 6; i++) t = withStepAdded(t, i === 0 ? 'x'.repeat(60) : `etapa ${i}`, `s${i}`)
  t = withStepToggled(t, 's1')
  const steps = focusSteps(t)
  assert.equal(steps.length, 4)
  assert.equal(steps[0].length, 40)
  assert.ok(!steps.includes('etapa 1'))
})

test('concluir registra a data e reabrir limpa', () => {
  const done = withDone(base, true, new Date('2026-11-02T10:00:00Z'))
  assert.equal(done.completedAt, '2026-11-02T10:00:00.000Z')
  assert.equal(withDone(done, false).completedAt, null)
})

test('descrição curta mostra atraso', () => {
  assert.equal(taskMeta({ ...base, dueDate: '2026-11-01' }, '2026-11-02'), '30 min · prioridade média · atrasada')
})

test('agrupa por situação e data', () => {
  const mk = (id: string, dueDate: string | null, done = false) => ({ id, title: id, priority: 'MEDIUM' as const, estimatedMinutes: null, dueDate, done, completedAt: null, steps: [] })
  const g = groupTasks([mk('a', '2026-11-01'), mk('b', '2026-11-02'), mk('c', '2026-11-05'), mk('d', null), mk('e', '2026-11-02', true)], '2026-11-02')
  assert.deepEqual(g.map((x) => [x.key, x.tasks.map((t) => t.id)]), [['overdue', ['a']], ['today', ['b']], ['upcoming', ['c']], ['noDate', ['d']], ['done', ['e']]])
})

test('confirmação avisa microetapas abertas', () => {
  const base = { id: 'x', title: 'x', priority: 'LOW' as const, estimatedMinutes: null, dueDate: null, done: false, completedAt: null }
  assert.match(doneConfirmation({ ...base, steps: [{ id: '1', text: 'a', done: false }, { id: '2', text: 'b', done: true }] }), /falta 1 microetapa/)
  assert.match(doneConfirmation({ ...base, steps: [] }), /sai da lista/)
})
