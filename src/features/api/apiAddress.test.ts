import { test } from 'node:test'
import assert from 'node:assert/strict'
import { apiUrlFromHost, hostnameOf, normalizeApiUrl } from './apiAddress.ts'

test('usa o mesmo computador do Metro na porta da API', () => {
  assert.equal(apiUrlFromHost('192.168.0.15:8081'), 'http://192.168.0.15:8080')
  assert.equal(apiUrlFromHost('10.0.2.2:8081', '9090'), 'http://10.0.2.2:9090')
})

test('sem endereço do Metro ou em túnel, cai em localhost', () => {
  assert.equal(apiUrlFromHost(null), 'http://localhost:8080')
  assert.equal(apiUrlFromHost('abc-anonymous-8081.exp.direct'), 'http://localhost:8080')
})

test('extrai o nome do host de vários formatos', () => {
  assert.equal(hostnameOf('http://localhost:8090/app'), 'localhost')
  assert.equal(hostnameOf('meu-pc.local:8081'), 'meu-pc.local')
  assert.equal(hostnameOf(''), null)
})

test('endereço digitado ganha protocolo e porta padrão', () => {
  assert.equal(normalizeApiUrl('192.168.1.20'), 'http://192.168.1.20:8080')
  assert.equal(normalizeApiUrl('http://192.168.1.20:9000/'), 'http://192.168.1.20:9000')
  assert.equal(normalizeApiUrl('https://api.kaluana.app'), 'https://api.kaluana.app')
  assert.equal(normalizeApiUrl('   '), null)
})
