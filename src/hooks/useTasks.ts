import type { Task } from '../types/domain'
import { useCollection } from './useCollection'
import { tasksSource, addStep, removeStep, updateStep } from '../services/tasksApi'
import { newId } from '../services/storage'
import { withDone, withStepAdded, withStepRemoved, withStepToggled } from '../features/tasks/taskModel'

/**
 * RF5: tarefas e microetapas. Com conta, cada ação passa pela API; sem conta,
 * as mesmas regras (taskModel) rodam só no aparelho. As telas não sabem a diferença.
 */
export function useTasks() {
  const collection = useCollection<Task>(tasksSource)
  const { items, mutate, upsert } = collection
  const find = (id: string) => items.find((t) => t.id === id)

  return {
    ...collection,
    setDone: (task: Task, done: boolean) => upsert(withDone(task, done)),
    addStep: (task: Task, text: string) => mutate((token) => addStep(token, task.id, text.trim()), withStepAdded(task, text, newId())),
    toggleStep: (task: Task, stepId: string) => {
      const next = withStepToggled(task, stepId)
      const step = next.steps.find((s) => s.id === stepId)
      return step ? mutate((token) => updateStep(token, task.id, step), next) : Promise.resolve(null)
    },
    removeStep: (task: Task, stepId: string) => mutate((token) => removeStep(token, task.id, stepId), withStepRemoved(task, stepId)),
    find,
  }
}
