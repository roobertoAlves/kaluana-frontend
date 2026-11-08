import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fromAssistant, shouldOfferAssistant, withoutKind } from './assistantParse.ts'
import { parseQuickTask } from './quickAdd.ts'

const HOJE = new Date(2026, 10, 8)

test('o assistente só é oferecido quando as regras não reconheceram nada numa frase', () => {
  const frase = 'preciso ver o boleto da luz antes de sexta que vem'
  assert.equal(shouldOfferAssistant('preciso ver boleto', parseQuickTask('preciso ver boleto', HOJE)), true)
  assert.equal(shouldOfferAssistant('estudar amanhã 30min', parseQuickTask('estudar amanhã 30min', HOJE)), false)
  assert.equal(shouldOfferAssistant('boleto', parseQuickTask('boleto', HOJE)), false)
  assert.equal(shouldOfferAssistant(frase, parseQuickTask(frase, HOJE)), false)
})

test('resposta do assistente vira os mesmos chips da entrada rápida', () => {
  const r = fromAssistant(
    { title: 'Pagar o boleto da luz', dueDate: '2026-11-09', estimatedMinutes: 10, priority: 'HIGH', steps: ['Abrir o app do banco'] },
    HOJE,
  )
  assert.deepEqual(
    r.tokens.map((t) => t.label),
    ['amanhã · 09/11', '10 min', 'prioridade alta', '1 microetapa'],
  )
  assert.equal(r.title, 'Pagar o boleto da luz')
})

test('campos vazios não geram chips e o × desfaz só aquele campo', () => {
  const r = fromAssistant({ title: 'Ligar', dueDate: '2027-01-05', estimatedMinutes: null, priority: null, steps: [] }, HOJE)
  assert.deepEqual(r.tokens, [{ kind: 'date', label: '05/01/2027' }])
  const semData = withoutKind(r, 'date')
  assert.equal(semData.dueDate, null)
  assert.deepEqual(semData.tokens, [])
  assert.equal(semData.title, 'Ligar')
})
