export type EventCategory = 'SOCIAL' | 'IMPULSIVIDADE' | 'URGENCIA' | 'SOBRECARGA'

export interface LifeEvent {
  id: string
  category: EventCategory
  text?: string
  urgent: boolean
  timestamp: string
}

export type ReminderFrequency = 'ONCE' | 'DAILY' | 'WEEKLY'
export type ReminderInsistence = 'LOW' | 'MEDIUM' | 'HIGH'

export interface Reminder {
  id: string
  title: string
  time: string
  leadMinutes: number
  frequency: ReminderFrequency
  insistence: ReminderInsistence
  enabled: boolean
}

export interface CheckIn {
  id: string
  date: string
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

export interface AccessSettings {
  events: boolean
  checkins: boolean
  usage: boolean
  reports: boolean
}

export const DEFAULT_ACCESS: AccessSettings = { events: false, checkins: false, usage: false, reports: false }

export type LinkRelationship = 'FAMILY' | 'HEALTH_PROFESSIONAL' | 'OTHER'

export interface LinkPermissions extends AccessSettings {
  relationship: LinkRelationship
  tasks: boolean
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface TaskStep {
  id: string
  text: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  priority: TaskPriority
  estimatedMinutes: number | null
  dueDate: string | null
  done: boolean
  completedAt: string | null
  steps: TaskStep[]
}

export type TimerSound = 'NONE' | 'WHITE' | 'PINK' | 'BROWN'

export interface DayPlanBlock {
  kind: 'TASK' | 'BREAK'
  taskId: string | null
  title: string
  start: string
  end: string
}

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
  windowEnd: string
  blocks: DayPlanBlock[]
  unscheduled: { taskId: string; title: string; minutes: number }[]
  changes: PlanChange[]
}
