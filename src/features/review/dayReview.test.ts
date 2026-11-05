import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Task } from '../../types/domain.ts'
import { applyMove, completedOn, nextDay, pendingFor, shouldOfferReview, summaryLine } from './dayReview.ts'

const DAY = '2026-11-02'
const task = (id: string, dueDate: string | null, done = false, completedAt: string | null = null): Task => ({
  id, title: id, priority: 'MEDIUM', estimatedMinutes: 25, dueDate, done, completedAt, steps: [],
})

test('pendentes do dia: com data até hoje e não concluídas', () => {
  const list = [task('hoje', DAY), task('atrasada', '2026-10-30'), task('amanha', '2026-11-03'), task('sem data', null), task('feita', DAY, true)]
  assert.deepEqual(pendingFor(list, DAY).map((t) => t.id), ['hoje', 'atrasada'])
})

test('concluídas no dia pelo horário local', () => {
  const doneToday = task('a', DAY, true, new Date(2026, 10, 2, 21, 30).toISOString())
  const doneYesterday = task('b', DAY, true, new Date(2026, 10, 1, 23, 0).toISOString())
  assert.deepEqual(completedOn([doneToday, doneYesterday], DAY).map((t) => t.id), ['a'])
})

test('decisões mudam só o que devem', () => {
  const t = task('x', DAY)
  assert.equal(applyMove(t, 'TOMORROW', DAY).dueDate, '2026-11-03')
  assert.equal(applyMove(t, 'NO_DATE', DAY).dueDate, null)
  const done = applyMove(t, 'DONE', DAY, new Date(2026, 10, 2, 22, 0))
  assert.equal(done.done, true)
  assert.equal(done.dueDate, DAY)
})

test('dia seguinte vira o mês e o ano', () => {
  assert.equal(nextDay('2026-11-30'), '2026-12-01')
  assert.equal(nextDay('2026-12-31'), '2027-01-01')
})

test('atalho aparece das 18h em diante, uma vez por dia', () => {
  assert.equal(shouldOfferReview(new Date(2026, 10, 2, 17, 59), null), false)
  assert.equal(shouldOfferReview(new Date(2026, 10, 2, 18, 0), null), true)
  assert.equal(shouldOfferReview(new Date(2026, 10, 2, 21, 0), DAY), false)
  assert.equal(shouldOfferReview(new Date(2026, 10, 2, 21, 0), '2026-11-01'), true)
})

test('frase de resumo', () => {
  assert.equal(summaryLine([{ taskId: 'a', action: 'TOMORROW' }, { taskId: 'b', action: 'NO_DATE' }]), '1 tarefa foi para amanhã e 1 ficou sem data.')
  assert.equal(summaryLine([]), 'Nada foi mudado nas tarefas.')
  assert.equal(summaryLine([{ taskId: 'a', action: 'DONE' }, { taskId: 'b', action: 'DONE' }]), '2 foram marcadas como concluídas.')
})
