import { useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { Task, TaskPriority } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ChipGroup, SmallButton, formStyles } from '../../components/ui/forms'
import { Icon } from '../../components/ui/Icons'
import { PressableScale } from '../../components/motion/PressableScale'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/useTasks'
import { useAssistantStatus } from '../../hooks/useAssistantStatus'
import { suggestSteps } from '../../services/assistantApi'
import { errorMessage } from '../../services/http'
import { newId, todayKey } from '../../services/storage'
import { focusSteps, sortForList } from '../../features/tasks/taskModel'
import { TaskRow } from './TaskRow'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]
const DURATIONS = [0, 10, 25, 50].map((m) => ({ value: m, label: m === 0 ? 'Não sei' : `${m} min` }))
const WHEN = [
  { value: 'today', label: 'Hoje' },
  { value: 'tomorrow', label: 'Amanhã' },
  { value: 'none', label: 'Sem data' },
] as const

function dueFrom(when: (typeof WHEN)[number]['value']): string | null {
  if (when === 'none') return null
  const d = new Date()
  if (when === 'tomorrow') d.setDate(d.getDate() + 1)
  return todayKey(d)
}

/** RF5: "o que eu preciso fazer?" Lista curta de pendentes, com microetapas sob demanda. */
export function TasksScreen({ navigation }: Props) {
  const { accessToken } = useAuth()
  const tasks = useTasks()
  const assistant = useAssistantStatus()
  const [title, setTitle] = useState('')
  const [more, setMore] = useState(false)
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [minutes, setMinutes] = useState(0)
  const [when, setWhen] = useState<(typeof WHEN)[number]['value']>('today')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const today = todayKey()

  const sorted = sortForList(tasks.items)
  const pending = sorted.filter((t) => !t.done)
  const done = sorted.filter((t) => t.done)

  async function create() {
    if (!title.trim()) return
    const task: Task = {
      id: newId(),
      title: title.trim(),
      priority,
      estimatedMinutes: minutes || null,
      dueDate: dueFrom(when),
      done: false,
      completedAt: null,
      steps: [],
    }
    const saved = await tasks.add(task)
    if (!saved) return
    setTitle('')
    setExpanded(saved.id)
  }

  function confirmDelete(task: Task) {
    Alert.alert(`Apagar "${task.title}"?`, 'As microetapas também serão apagadas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => void tasks.remove(task.id) },
    ])
  }

  async function suggest(task: Task): Promise<string[] | null> {
    if (!accessToken) return null
    try {
      setLocalError(null)
      return (await suggestSteps(accessToken, task.id)).steps
    } catch (e) {
      setLocalError(errorMessage(e, 'O assistente não respondeu agora.'))
      return null
    }
  }

  const row = (task: Task, index: number) => (
    <TaskRow
      key={task.id}
      task={task}
      today={today}
      index={index}
      expanded={expanded === task.id}
      assistantEnabled={assistant.enabled}
      onToggleExpand={() => setExpanded(expanded === task.id ? null : task.id)}
      onToggleDone={() => void tasks.setDone(task, !task.done)}
      onToggleStep={(stepId) => void tasks.toggleStep(task, stepId)}
      onAddStep={(text) => tasks.addStep(task, text)}
      onRemoveStep={(stepId) => void tasks.removeStep(task, stepId)}
      onFocus={() =>
        navigation.navigate('TimerPlan', {
          preset: { task: task.title.slice(0, 60), minutes: task.estimatedMinutes ?? 25, steps: focusSteps(task), taskId: task.id },
        })
      }
      onDelete={() => confirmDelete(task)}
      onSuggestSteps={() => suggest(task)}
    />
  )

  return (
    <Screen label="KALUANA · TAREFAS" title="Tarefas" onBack={() => navigation.goBack()} error={tasks.error ?? localError}>
      <View style={styles.addRow}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="O que você precisa fazer?"
          placeholderTextColor={colors.sand}
          accessibilityLabel="Nova tarefa"
          maxLength={120}
          returnKeyType="done"
          onSubmitEditing={create}
          style={styles.addInput}
        />
        <PressableScale onPress={create} accessibilityRole="button" accessibilityLabel="Adicionar tarefa" style={styles.addButton}>
          <Icon name="plus" color={colors.white} />
        </PressableScale>
      </View>

      <SmallButton label={more ? 'Menos opções' : 'Prioridade, duração e data'} onPress={() => setMore(!more)} />
      {more && (
        <View style={{ marginTop: spacing[3] }}>
          <ChipGroup label="PRIORIDADE" options={PRIORITIES} value={priority} onChange={setPriority} />
          <ChipGroup label="QUANTO TEMPO LEVA" options={DURATIONS} value={minutes} onChange={setMinutes} />
          <ChipGroup label="QUANDO" options={WHEN.map((w) => ({ value: w.value, label: w.label }))} value={when} onChange={setWhen} />
        </View>
      )}

      <View style={styles.headerRow}>
        <Text style={formStyles.sectionTitle}>PENDENTES ({pending.length})</Text>
      </View>

      {!tasks.loading && pending.length === 0 && (
        <View style={styles.empty}>
          <Text style={formStyles.muted}>Nada pendente. Escreva acima a próxima coisa a fazer; dá para dividir em passos pequenos depois.</Text>
        </View>
      )}
      {pending.map(row)}

      {done.length > 0 && (
        <>
          <SmallButton label={showDone ? `Esconder concluídas (${done.length})` : `Ver concluídas (${done.length})`} onPress={() => setShowDone(!showDone)} />
          {showDone && done.slice(0, 30).map(row)}
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', gap: spacing[2], alignItems: 'center' },
  addInput: { flex: 1, minHeight: 52, borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.md, paddingHorizontal: spacing[4], fontFamily: fonts.body, fontSize: 17, color: colors.ink, backgroundColor: colors.bgSurface },
  addButton: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.emberBright, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.sand, borderRadius: radius.lg, padding: spacing[4] },
})
