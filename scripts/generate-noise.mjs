import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RATE = 22050
const SECONDS = 12
const FADE = Math.round(RATE * 0.5)
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds')

function random(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function white(n, rnd) {
  return Float64Array.from({ length: n }, () => rnd() * 2 - 1)
}

function pink(n, rnd) {
  const out = new Float64Array(n)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < n; i++) {
    const w = rnd() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    out[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362
    b6 = w * 0.115926
  }
  return out
}

function brown(n, rnd) {
  const out = new Float64Array(n)
  let last = 0
  for (let i = 0; i < n; i++) {
    last = (last + 0.02 * (rnd() * 2 - 1)) / 1.02
    out[i] = last
  }
  return out
}

function seamless(signal) {
  const n = signal.length - FADE
  const out = signal.slice(0, n)
  for (let i = 0; i < FADE; i++) {
    const t = i / FADE
    out[i] = signal[n + i] * (1 - t) + signal[i] * t
  }
  return out
}

function normalize(signal, peak = 0.5) {
  const max = signal.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1
  return signal.map((v) => (v / max) * peak)
}

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2)
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2))
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVEfmt ', 8)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20)
  header.writeUInt16LE(1, 22)
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

mkdirSync(OUT, { recursive: true })
const total = RATE * SECONDS + FADE
for (const [name, make, seed] of [['white', white, 1], ['pink', pink, 2], ['brown', brown, 3]]) {
  const samples = normalize(seamless(make(total, random(seed))), name === 'white' ? 0.35 : 0.5)
  writeFileSync(join(OUT, `${name}-noise.wav`), wav(samples))
  console.log(`assets/sounds/${name}-noise.wav`)
}
