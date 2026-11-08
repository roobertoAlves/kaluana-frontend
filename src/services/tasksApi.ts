import type { Task } from '../types/domain'
import type { CollectionSource } from '../hooks/useCollection'
import { apiRequest } from './http'

const toBody = (t: Task) => ({
  title: t.title,
  priority: t.priority,
  estimatedMinutes: t.estimatedMinutes,
  dueDate: t.dueDate,
  done: t.done,
})

export const tasksSource: CollectionSource<Task> = {
  name: 'tasks',
  remote: {
    list: (token) => apiRequest<Task[]>('/api/tasks', { token }),
    create: (token, t) =>
      apiRequest<Task>('/api/tasks', { method: 'POST', token, body: { ...toBody(t), steps: t.steps.map((s) => s.text) } }),
    update: (token, t) => apiRequest<Task>(`/api/tasks/${t.id}`, { method: 'PUT', token, body: toBody(t) }),
    remove: (token, id) => apiRequest<void>(`/api/tasks/${id}`, { method: 'DELETE', token }),
  },
}

export function addStep(token: string, taskId: string, text: string) {
  return apiRequest<Task>(`/api/tasks/${taskId}/steps`, { method: 'POST', token, body: { text, done: false } })
}

export function updateStep(token: string, taskId: string, step: { id: string; text: string; done: boolean }) {
  return apiRequest<Task>(`/api/tasks/${taskId}/steps/${step.id}`, { method: 'PUT', token, body: { text: step.text, done: step.done } })
}

export function removeStep(token: string, taskId: string, stepId: string) {
  return apiRequest<Task>(`/api/tasks/${taskId}/steps/${stepId}`, { method: 'DELETE', token })
}
