import { MINUTE } from '../features/timer/timerSession'
import type { TimerSession } from '../features/timer/timerSession'
import { apiRequest } from './http'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function registerTimerSession(token: string, s: TimerSession) {
  if ((s.status !== 'DONE' && s.status !== 'CANCELED') || !s.finishedAt) return Promise.resolve()
  return apiRequest<void>('/api/timer-sessions', {
    method: 'POST',
    token,
    body: {
      taskId: s.taskId && UUID.test(s.taskId) ? s.taskId : null,
      task: s.task.slice(0, 80),
      plannedMinutes: Math.min(600, Math.max(1, Math.round(s.totalMs / MINUTE))),
      stepsCount: s.steps.length,
      water: s.water,
      sound: s.sound,
      status: s.status,
      startedAt: new Date(s.startedAt).toISOString(),
      finishedAt: new Date(s.finishedAt).toISOString(),
    },
  })
}
