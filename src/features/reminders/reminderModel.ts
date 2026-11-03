import type { Reminder, ReminderFrequency, ReminderInsistence } from '../../types/domain'

/** Regras puras da tela de lembretes (RF2): sem React, testáveis no Node. */

export const FREQUENCY_LABEL: Record<ReminderFrequency, string> = { ONCE: 'Uma vez', DAILY: 'Todo dia', WEEKLY: 'Toda semana' }
export const INSISTENCE_LABEL: Record<ReminderInsistence, string> = { LOW: 'suave', MEDIUM: 'média', HIGH: 'alta' }

/** Atalhos de nome no formulário: os lembretes mais comuns em um toque. */
export const REMINDER_SUGGESTIONS = ['Beber água', 'Tomar remédio', 'Fazer uma pausa', 'Sair para compromisso']

const pad = (n: number) => String(n).padStart(2, '0')

/** Próximo horário em que `time` ("HH:MM") ocorre, menos a antecedência. */
export function nextFireTime(time: string, leadMinutes: number, now: Date = new Date()): Date {
  const [h, m] = time.split(':').map(Number)
  const target = new Date(now)
  target.setHours(h, m, 0, 0)
  let fire = new Date(target.getTime() - leadMinutes * 60_000)
  while (fire.getTime() <= now.getTime()) fire = new Date(fire.getTime() + 24 * 60 * 60_000)
  return fire
}

/** "hoje às 08:20" / "amanhã às 08:20". */
export function fireLabel(at: Date, now: Date = new Date()): string {
  const sameDay = at.toDateString() === now.toDateString()
  return `${sameDay ? 'hoje' : 'amanhã'} às ${pad(at.getHours())}:${pad(at.getMinutes())}`
}

/** Linha de detalhes do cartão: frequência, antecedência e insistência. */
export function describeReminder(r: Reminder): string {
  const lead = r.leadMinutes > 0 ? `avisa ${r.leadMinutes} min antes` : 'avisa na hora'
  return `${FREQUENCY_LABEL[r.frequency]} · ${lead} · insistência ${INSISTENCE_LABEL[r.insistence]}`
}

export interface ReminderGroups {
  active: { reminder: Reminder; at: Date }[]
  paused: Reminder[]
}

/** Ativos em ordem do próximo aviso; pausados em ordem de horário. */
export function groupReminders(list: Reminder[], now: Date = new Date()): ReminderGroups {
  const active = list
    .filter((r) => r.enabled)
    .map((reminder) => ({ reminder, at: nextFireTime(reminder.time, reminder.leadMinutes, now) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())
  const paused = list.filter((r) => !r.enabled).sort((a, b) => a.time.localeCompare(b.time))
  return { active, paused }
}
