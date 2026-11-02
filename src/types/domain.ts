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

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface TaskStep {
  id: string
  text: string
  done: boolean
}

/** RF5: tarefa com microetapas. Mesmo formato de /api/tasks. */
export interface Task {
  id: string
  title: string
  priority: TaskPriority
  /** Duração estimada em minutos (5 a 480); vazio = 25 no plano do dia. */
  estimatedMinutes: number | null
  /** "YYYY-MM-DD" no fuso local, ou null. */
  dueDate: string | null
  done: boolean
  completedAt: string | null
  steps: TaskStep[]
}

export type TimerSound = 'NONE' | 'WHITE' | 'PINK' | 'BROWN'

/** RF10: plano do dia. Mesmo formato de GET /api/day-plan. */
export interface DayPlanBlock {
  kind: 'TASK' | 'BREAK'
  taskId: string | null
  title: string
  /** "HH:MM" */
  start: string
  end: string
}

/** RF14: o que mudou num replanejamento; {@code from}/{@code to} são "HH:MM". */
export interface PlanChange {
  taskId: string
  title: string
  kind: 'MOVED' | 'ADDED' | 'DONE' | 'REMOVED' | 'DROPPED'
  from: string | null
  to: string | null
}

export interface DayPlan {
  date: string
  energyLevel: number | null
  source: 'RULES' | 'ASSISTANT'
  note: string | null
  /** Fim da janela do plano ("HH:MM"), usado ao replanejar. */
  windowEnd: string
  blocks: DayPlanBlock[]
  unscheduled: { taskId: string; title: string; minutes: number }[]
  /** Só vem preenchido no replanejamento. */
  changes: PlanChange[]
}
