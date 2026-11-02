import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseQuickTask } from './quickAdd.ts'

// Segunda-feira, 2 de novembro de 2026.
const TODAY = new Date(2026, 10, 2)
const parse = (s: string, ignore: string[] = []) => parseQuickTask(s, TODAY, new Set(ignore as never[]))

test('frase completa: data, duração e prioridade saem do título', () => {
  const r = parse('estudar cálculo amanhã 30min !alta')
  assert.equal(r.title, 'Estudar cálculo')
  assert.equal(r.dueDate, '2026-11-03')
  assert.equal(r.estimatedMinutes, 30)
  assert.equal(r.priority, 'HIGH')
  assert.deepEqual(r.tokens.map((t) => t.label), ['amanhã · 03/11', '30 min', 'prioridade alta'])
})

test('datas relativas e dias da semana', () => {
  assert.equal(parse('ligar hoje').dueDate, '2026-11-02')
  assert.equal(parse('ligar depois de amanhã').dueDate, '2026-11-04')
  assert.equal(parse('ligar até amanhã').title, 'Ligar')
  assert.equal(parse('feira no sábado').dueDate, '2026-11-07')
  assert.equal(parse('reunião sexta-feira').dueDate, '2026-11-06')
  // Hoje é segunda: "segunda" é a da semana que vem, nunca hoje.
  assert.equal(parse('treino segunda').dueDate, '2026-11-09')
})

test('datas numéricas e "dia N"', () => {
  assert.equal(parse('prova 15/11').dueDate, '2026-11-15')
  assert.equal(parse('matrícula 10/01').dueDate, '2027-01-10', 'data já passada vai para o ano seguinte')
  assert.equal(parse('entrega 05/03/2027').dueDate, '2027-03-05')
  assert.equal(parse('pagar dia 10').dueDate, '2026-11-10')
  assert.equal(parse('pagar dia 1').dueDate, '2026-12-01')
  assert.equal(parse('boleto 31/02').dueDate, null, 'data inexistente não é interpretada')
})

test('durações em minutos e horas, dentro do limite das tarefas', () => {
  assert.equal(parse('ler 45 minutos').estimatedMinutes, 45)
  assert.equal(parse('ler 1h').estimatedMinutes, 60)
  assert.equal(parse('ler 1h30').estimatedMinutes, 90)
  assert.equal(parse('ler 2 horas').estimatedMinutes, 120)
  assert.equal(parse('ler 1 hora e 15 minutos').estimatedMinutes, 75)
  assert.equal(parse('ler 2min').estimatedMinutes, null, 'menos de 5 min fica no título')
  assert.equal(parse('ler 9h').estimatedMinutes, null, 'mais de 8 h fica no título')
})

test('prioridade com ou sem acento', () => {
  assert.equal(parse('lavar louça !média').priority, 'MEDIUM')
  assert.equal(parse('lavar louça !media').priority, 'MEDIUM')
  assert.equal(parse('lavar louça !baixa').priority, 'LOW')
})

test('microetapas depois do ponto e vírgula', () => {
  const r = parse('lavar louça; separar; lavar ; ; secar')
  assert.equal(r.title, 'Lavar louça')
  assert.deepEqual(r.steps, ['separar', 'lavar', 'secar'])
  assert.equal(r.tokens.at(-1)?.label, '3 microetapas')
})

test('desfazer uma interpretação devolve o trecho ao título', () => {
  const r = parse('estudar amanhã 30min', ['date'])
  assert.equal(r.title, 'Estudar amanhã')
  assert.equal(r.dueDate, null)
  assert.equal(r.estimatedMinutes, 30)
})

test('palavras dentro de outras não contam', () => {
  const r = parse('comprar 3 metros de tecido')
  assert.equal(r.title, 'Comprar 3 metros de tecido')
  assert.deepEqual(r.tokens, [])
})

test('se nada sobra para o título, a frase inteira é o título', () => {
  const r = parse('amanhã')
  assert.equal(r.title, 'amanhã')
  assert.equal(r.dueDate, null)
})
