/** Tipos de domínio dos módulos locais (RF1 a RF8). Persistidos por usuário. */

export type EventCategory = 'SOCIAL' | 'IMPULSIVIDADE' | 'URGENCIA' | 'SOBRECARGA'

export interface LifeEvent {
  id: string
  category: EventCategory
  text?: string
  urgent: boolean
  timestamp: string // ISO
}

export type ReminderFrequency = 'ONCE' | 'DAILY' | 'WEEKLY'
export type ReminderInsistence = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Reminder {
  id: string
  title: string
  /** Horário do compromisso, "HH:MM". */
  time: string
  /** Antecedência em minutos: a notificação sai `leadMinutes` antes de `time`. */
  leadMinutes: number
  frequency: ReminderFrequency
  insistence: ReminderInsistence
  enabled: boolean
}

export interface CheckIn {
  id: string
  /** "YYYY-MM-DD" no fuso local. Um check-in por dia (o novo substitui o do dia). */
  date: string
  /** 1 (mais difícil) a 5 (mais tranquilo). Descritivo: não tem função diagnóstica. */
  level: 1 | 2 | 3 | 4 | 5
  timestamp: string
}

export type ContactMethod = 'LIGACAO' | 'MENSAGEM' | 'WHATSAPP' | 'EMAIL'

export interface TrustedContact {
  id: string
  name: string
  method: ContactMethod
  value: string
}

/** RF8: o que o responsável/profissional emparelhado pode ver. */
export interface AccessSettings {
  events: boolean
  checkins: boolean
  usage: boolean
  reports: boolean
}

export const DEFAULT_ACCESS: AccessSettings = { events: false, checkins: false, usage: false, reports: false }
