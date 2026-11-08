import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  abandonGuide,
  chooseOption,
  currentStep,
  orderOptions,
  pauseGuide,
  resumeGuide,
  secondsLeft,
  startGuide,
  summarize,
  tickGuide,
  validateGuide,
} from './guideMachine.ts'
import type { GuideDefinition } from './guideMachine.ts'
import { GUIDES, OVERLOAD_GUIDE as G } from './guides.ts'

const T0 = Date.UTC(2026, 10, 8, 13, 0)

test('todos os guias são válidos (2 ou 3 opções, destinos existentes, sempre chegam a um fim)', () => {
  for (const guide of GUIDES) assert.deepEqual(validateGuide(guide), [], guide.id)
})

test('a mesma sequência de escolhas sempre leva à mesma etapa', () => {
  const run = (choices: string[]) => choices.reduce((r, c, i) => chooseOption(G, r, c, T0 + i * 1000), startGuide(G, T0))
  const a = run(['muita-coisa', 'agua'])
  const b = run(['muita-coisa', 'agua'])
  assert.equal(a.stepId, 'depois')
  assert.deepEqual(a, b)
})

test('chegar à etapa final conclui a sessão', () => {
  let r = startGuide(G, T0)
  r = chooseOption(G, r, 'comecar', T0 + 1000)
  r = chooseOption(G, r, 'tarefas', T0 + 2000)
  assert.equal(r.status, 'COMPLETED')
  assert.equal(r.finishedAt, T0 + 2000)
  assert.deepEqual(summarize(r), {
    guideId: 'sobrecarga',
    guideVersion: 1,
    status: 'COMPLETED',
    stepsCount: 2,
    startedAt: new Date(T0).toISOString(),
    finishedAt: new Date(T0 + 2000).toISOString(),
  })
})

test('prazo da etapa vencido segue pela opção padrão', () => {
  let r = chooseOption(G, startGuide(G, T0), 'muita-coisa', T0)
  assert.equal(secondsLeft(G, r, T0 + 30_000), 90)
  assert.equal(tickGuide(G, r, T0 + 119_000).stepId, 'pausa')
  r = tickGuide(G, r, T0 + 120_000)
  assert.equal(r.stepId, 'depois')
  assert.deepEqual(r.path, ['inicio', 'pausa', 'depois'])
})

test('pausa congela o prazo e retomar desconta o tempo parado', () => {
  let r = chooseOption(G, startGuide(G, T0), 'muita-coisa', T0)
  r = pauseGuide(r, T0 + 60_000)
  assert.equal(r.status, 'INTERRUPTED')
  assert.equal(tickGuide(G, r, T0 + 600_000).stepId, 'pausa')
  assert.equal(chooseOption(G, r, 'agua', T0 + 600_000).stepId, 'pausa')
  r = resumeGuide(r, T0 + 300_000)
  assert.equal(secondsLeft(G, r, T0 + 300_000), 60)
})

test('encerrar abandona; sessão em andamento não gera resumo', () => {
  const r = startGuide(G, T0)
  assert.equal(summarize(r), null)
  const fim = abandonGuide(r, T0 + 5000)
  assert.equal(fim.status, 'ABANDONED')
  assert.equal(summarize(fim)?.stepsCount, 0)
  assert.equal(abandonGuide(fim, T0 + 9000).finishedAt, T0 + 5000)
})

test('ordem sugerida só vale se for uma permutação das opções', () => {
  const step = currentStep(G, startGuide(G, T0))
  assert.deepEqual(
    orderOptions(step, [2, 0, 1]).map((o) => o.id),
    ['comecar', 'muita-coisa', 'ambiente'],
  )
  assert.deepEqual(orderOptions(step, [2, 2, 1]), step.options)
  assert.deepEqual(orderOptions(step, [0, 1]), step.options)
  assert.deepEqual(orderOptions(step, null), step.options)
})

test('validação aponta etapa sem saída e destino inexistente', () => {
  const ruim: GuideDefinition = {
    id: 'x',
    version: 1,
    title: 'x',
    summary: 'x',
    start: 'a',
    steps: {
      a: {
        id: 'a',
        text: 'a',
        options: [
          { id: '1', label: '1', next: 'b' },
          { id: '2', label: '2', next: 'z' },
        ],
      },
      b: {
        id: 'b',
        text: 'b',
        options: [
          { id: '3', label: '3', next: 'a' },
          { id: '4', label: '4', next: 'b' },
        ],
      },
    },
  }
  const erros = validateGuide(ruim)
  assert.ok(erros.some((e) => e.includes('inexistente')))
  assert.ok(erros.some((e) => e.includes('não chega a um fim')))
})
