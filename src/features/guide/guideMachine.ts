import type { GuideAction, GuideDefinition } from './guideDefinition.ts'

/**
 * Máquina de estados finita do guia (RNF1). Funções puras: o tempo entra
 * sempre como parâmetro (`now`, em ms), então o comportamento é determinístico
 * e testável sem interface, sem timers reais e sem dispositivo.
 *
 * Prazos são guardados como horário absoluto (`deadline`). Se o app for fechado
 * ou ficar em segundo plano, `reevaluate` recalcula o estado ao reabrir (RNF2).
 */

export type GuideStatus = 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED' | 'ABANDONED'

export interface GuideSession {
  definitionId: string
  definitionVersion: number
  current: string
  status: GuideStatus
  startedAt: number
  enteredAt: number
  finishedAt: number | null
  /** Horário (ms) em que a etapa temporizada vence; null se a etapa não tem timer. */
  deadline: number | null
  /** Tempo restante guardado enquanto o guia está pausado. */
  pausedRemainingMs: number | null
  history: string[]
}

export interface ChooseResult {
  session: GuideSession
  action?: GuideAction
}

export function validateDefinition(def: GuideDefinition): string[] {
  const errors: string[] = []
  if (!def.states[def.initial]) errors.push(`estado inicial "${def.initial}" não existe`)
  for (const s of Object.values(def.states)) {
    const opts = s.options ?? []
    if (opts.length > 3) errors.push(`"${s.id}" tem mais de 3 opções`)
    if (!s.terminal && !s.timer && opts.length === 0) errors.push(`"${s.id}" é um beco sem saída`)
    if (s.terminal && (opts.length > 0 || s.timer)) errors.push(`"${s.id}" é final mas tem saídas`)
    for (const o of opts) if (!def.states[o.next]) errors.push(`"${s.id}" → "${o.next}" não existe`)
    if (s.timer && !def.states[s.timer.next]) errors.push(`"${s.id}" timer → "${s.timer.next}" não existe`)
  }
  return errors
}

function enter(def: GuideDefinition, s: GuideSession, stateId: string, now: number, at: number = now): GuideSession {
  const st = def.states[stateId]
  const base = { ...s, current: stateId, enteredAt: at, history: [...s.history, stateId], pausedRemainingMs: null }
  if (st.terminal) return { ...base, status: 'COMPLETED', finishedAt: at, deadline: null }
  return { ...base, status: 'ACTIVE', deadline: st.timer ? at + st.timer.seconds * 1000 : null }
}

export function startSession(def: GuideDefinition, now: number): GuideSession {
  const empty: GuideSession = {
    definitionId: def.id,
    definitionVersion: def.version,
    current: def.initial,
    status: 'ACTIVE',
    startedAt: now,
    enteredAt: now,
    finishedAt: null,
    deadline: null,
    pausedRemainingMs: null,
    history: [],
  }
  return enter(def, empty, def.initial, now)
}

export function choose(def: GuideDefinition, s: GuideSession, optionId: string, now: number): ChooseResult {
  if (s.status !== 'ACTIVE') return { session: s }
  const opt = def.states[s.current]?.options?.find((o) => o.id === optionId)
  if (!opt) return { session: s } // opção inválida: ignora, estado não muda
  return { session: reevaluate(def, enter(def, s, opt.next, now), now), action: opt.action }
}

/**
 * Avança etapas temporizadas vencidas. Encadeia: se o app ficou fechado tempo
 * suficiente para vencer várias etapas, todas são percorridas; cada uma é
 * registrada com o horário em que realmente venceu.
 */
export function reevaluate(def: GuideDefinition, s: GuideSession, now: number): GuideSession {
  let cur = s
  while (cur.status === 'ACTIVE' && cur.deadline !== null && cur.deadline <= now) {
    const timer = def.states[cur.current].timer
    if (!timer) break
    cur = enter(def, cur, timer.next, now, cur.deadline)
  }
  return cur
}

export function remainingSeconds(s: GuideSession, now: number): number | null {
  if (s.status === 'INTERRUPTED' && s.pausedRemainingMs !== null) return Math.ceil(s.pausedRemainingMs / 1000)
  if (s.status !== 'ACTIVE' || s.deadline === null) return null
  return Math.max(0, Math.ceil((s.deadline - now) / 1000))
}

export function interrupt(s: GuideSession, now: number): GuideSession {
  if (s.status !== 'ACTIVE') return s
  return { ...s, status: 'INTERRUPTED', pausedRemainingMs: s.deadline === null ? null : Math.max(0, s.deadline - now), deadline: null }
}

export function resume(def: GuideDefinition, s: GuideSession, now: number): GuideSession {
  if (s.status !== 'INTERRUPTED') return s
  const deadline = s.pausedRemainingMs === null ? null : now + s.pausedRemainingMs
  return reevaluate(def, { ...s, status: 'ACTIVE', deadline, pausedRemainingMs: null }, now)
}

export function abandon(s: GuideSession, now: number): GuideSession {
  if (s.status === 'COMPLETED' || s.status === 'ABANDONED') return s
  return { ...s, status: 'ABANDONED', finishedAt: now, deadline: null, pausedRemainingMs: null }
}
