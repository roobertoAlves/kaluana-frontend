// Gera os sons do app (RF9 e RF16) em assets/sounds/*.wav: ruídos e paisagens.
// Ruídos branco, rosa e marrom, 12 s em loop sem emenda audível.
// Uso: node scripts/generate-noise.mjs   (determinístico: mesma semente, mesmos arquivos)
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RATE = 22050
const SECONDS = 12
const FADE = Math.round(RATE * 0.5) // 0,5 s de cruzamento entre fim e começo
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'sounds')

// Gerador pseudoaleatório com semente (mulberry32), para builds reprodutíveis.
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

// Filtro de Paul Kellet: aproxima -3 dB por oitava.
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

// Passeio aleatório com fuga: -6 dB por oitava, som grave e "abafado".
function brown(n, rnd) {
  const out = new Float64Array(n)
  let last = 0
  for (let i = 0; i < n; i++) {
    last = (last + 0.02 * (rnd() * 2 - 1)) / 1.02
    out[i] = last
  }
  return out
}

/** Gera FADE amostras a mais e cruza o excesso com o começo: o loop não estala. */
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
  header.writeUInt32LE(16, 16) // tamanho do bloco fmt
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(RATE, 24)
  header.writeUInt32LE(RATE * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

// --- Paisagens sonoras (RF16) -------------------------------------------------
// Tudo a partir de ruído filtrado e modulado. As modulações têm período que
// divide o loop, para o começo e o fim do arquivo baterem.

/** Passa-baixa de um polo: quanto menor `a`, mais grave. */
function lowpass(signal, a) {
  const out = new Float64Array(signal.length)
  let y = 0
  for (let i = 0; i < signal.length; i++) {
    y += a * (signal[i] - y)
    out[i] = y
  }
  return out
}

const highpass = (signal, a) => {
  const low = lowpass(signal, a)
  return signal.map((v, i) => v - low[i])
}

/** Rajada curta de ruído com queda exponencial (gota, estalo, folha). */
function burst(out, at, length, amp, rnd, decay = 5) {
  for (let i = 0; i < length && at + i < out.length; i++) {
    out[at + i] += (rnd() * 2 - 1) * amp * Math.exp((-decay * i) / length)
  }
}

// Chuva: chiado agudo constante e muitas gotas pequenas.
function rain(n, rnd) {
  const out = highpass(pink(n, rnd), 0.05).map((v) => v * 0.6)
  const drops = Math.round((n / RATE) * 45)
  for (let d = 0; d < drops; d++) {
    burst(out, Math.floor(rnd() * n), Math.round(RATE * (0.004 + rnd() * 0.01)), 0.2 + rnd() * 0.6, rnd, 6)
  }
  return highpass(out, 0.02)
}

// Ondas: ruído grave que cresce e recua a cada 8 s.
function waves(n, rnd, loop) {
  const body = lowpass(pink(n, rnd), 0.08)
  const foam = highpass(white(n, rnd), 0.3)
  return body.map((v, i) => {
    const phase = (i % loop) / (RATE * 8)
    const swell = Math.pow(0.5 - 0.5 * Math.cos(2 * Math.PI * phase), 1.6)
    return v * (0.25 + 0.75 * swell) + foam[i] * 0.04 * swell
  })
}

// Lareira: fundo grave e estalos esparsos de tamanhos variados.
function fire(n, rnd) {
  const out = brown(n, rnd).map((v) => v * 0.9)
  const pops = Math.round((n / RATE) * 7)
  for (let p = 0; p < pops; p++) {
    const big = rnd() < 0.15
    burst(out, Math.floor(rnd() * n), Math.round(RATE * (big ? 0.03 : 0.006)), big ? 0.3 : 0.08 + rnd() * 0.1, rnd, big ? 4 : 7)
  }
  return out
}

// Floresta: vento que vai e volta (6 s e 4 s), folhas e um pássaro de vez em quando.
function forest(n, rnd, loop) {
  const wind = lowpass(pink(n, rnd), 0.03)
  const out = wind.map((v, i) => {
    const t = (i % loop) / RATE
    return v * (0.55 + 0.25 * Math.sin((2 * Math.PI * t) / 6) + 0.2 * Math.sin((2 * Math.PI * t) / 4))
  })
  const leaves = highpass(white(n, rnd), 0.4)
  for (let i = 0; i < n; i++) out[i] += leaves[i] * 0.03 * (0.5 + 0.5 * Math.sin((2 * Math.PI * (i % loop)) / (RATE * 3)))
  const chirps = Math.max(2, Math.round(n / RATE / 3))
  for (let c = 0; c < chirps; c++) {
    const at = Math.floor(rnd() * (n - RATE * 0.2))
    const length = Math.round(RATE * 0.09)
    const f0 = 3000 + rnd() * 1500
    for (let i = 0; i < length; i++) {
      const env = Math.sin((Math.PI * i) / length)
      out[at + i] += 0.12 * env * Math.sin((2 * Math.PI * (f0 + 1800 * (i / length)) * i) / RATE)
    }
  }
  return out
}

mkdirSync(OUT, { recursive: true })
const total = RATE * SECONDS + FADE
for (const [name, make, seed] of [['white', white, 1], ['pink', pink, 2], ['brown', brown, 3]]) {
  const samples = normalize(seamless(make(total, random(seed))), name === 'white' ? 0.35 : 0.5)
  writeFileSync(join(OUT, `${name}-noise.wav`), wav(samples))
  console.log(`assets/sounds/${name}-noise.wav`)
}

// Ondas usam 16 s (duas ondas de 8 s); as outras, os mesmos 12 s dos ruídos.
for (const [name, make, seed, seconds, peak] of [
  ['rain', rain, 11, 12, 0.45],
  ['waves', waves, 12, 16, 0.5],
  ['fire', fire, 13, 12, 0.5],
  ['forest', forest, 14, 12, 0.45],
]) {
  const loop = RATE * seconds
  const samples = normalize(seamless(make(loop + FADE, random(seed), loop)), peak)
  writeFileSync(join(OUT, `${name}.wav`), wav(samples))
  console.log(`assets/sounds/${name}.wav`)
}
