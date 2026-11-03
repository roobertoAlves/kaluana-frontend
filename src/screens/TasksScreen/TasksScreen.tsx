import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { Task } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { formStyles } from '../../components/ui/forms'
import { Icon } from '../../components/ui/Icons'
import { Sheet } from '../../components/ui/pickers/Sheet'
import { useAuth } from '../../context/AuthContext'
import { useTasks } from '../../hooks/useTasks'
import { useAssistantStatus } from '../../hooks/useAssistantStatus'
import { suggestSteps } from '../../services/assistantApi'
import { errorMessage } from '../../services/http'
import { todayKey } from '../../services/storage'
import { GROUP_TITLE, doneConfirmation, focusSteps, groupTasks } from '../../features/tasks/taskModel'
import { TaskRow } from './TaskRow'
import { TaskFormSheet } from './TaskFormSheet'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Tasks'>

type Form = { mode: 'new' } | { mode: 'edit'; task: Task }
type Confirm = { kind: 'done' | 'delete'; task: Task }

/**
 * RF5: "o que eu preciso fazer?". Uma ação principal (Nova tarefa), a lista
 * agrupada por quando fazer, e confirmação antes de concluir ou apagar.
 */
export function TasksScreen({ navigation }: Props) {
  const { accessToken } = useAuth()
  const tasks = useTasks()
  const assistant = useAssistantStatus()
  const [form, setForm] = useState<Form | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const today = todayKey()

  const groups = groupTasks(tasks.items, today)
  const pendingCount = tasks.items.filter((t) => !t.done).length
  const todayCount = groups.filter((g) => g.key === 'today' || g.key === 'overdue').reduce((n, g) => n + g.tasks.length, 0)

  async function save(task: Task) {
    const isNew = form?.mode === 'new'
    const saved = isNew ? await tasks.add(task) : await tasks.upsert(task)
    if (!saved) return
    setForm(null)
    if (isNew) setExpanded(saved.id)
  }

  async function confirmAction() {
    if (!confirm) return
    const { kind, task } = confirm
    setConfirm(null)
    if (kind === 'done') await tasks.setDone(task, true)
    else await tasks.remove(task.id)
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
      // Concluir pede confirmação; reabrir é direto (desfaz um engano).
      onToggleDone={() => (task.done ? void tasks.setDone(task, false) : setConfirm({ kind: 'done', task }))}
      onToggleStep={(stepId) => void tasks.toggleStep(task, stepId)}
      onAddStep={(text) => tasks.addStep(task, text)}
      onRemoveStep={(stepId) => void tasks.removeStep(task, stepId)}
      onFocus={() =>
        navigation.navigate('TimerPlan', {
          preset: { task: task.title.slice(0, 60), minutes: task.estimatedMinutes ?? 25, steps: focusSteps(task), taskId: task.id },
        })
      }
      onEdit={() => setForm({ mode: 'edit', task })}
      onDelete={() => setConfirm({ kind: 'delete', task })}
      onSuggestSteps={() => suggest(task)}
    />
  )

  return (
    <Screen label="KALUANA · TAREFAS" title="Tarefas" onBack={() => navigation.goBack()} error={tasks.error ?? localError}>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {pendingCount === 0 ? 'Nada pendente.' : `${pendingCount} pendente${pendingCount === 1 ? '' : 's'} · ${todayCount} para hoje`}
        </Text>
        {pendingCount > 0 && (
          <Pressable onPress={() => navigation.navigate('DayPlan')} accessibilityRole="button" hitSlop={8} style={styles.planLink}>
            <Icon name="calendar" size={18} />
            <Text style={styles.planLinkText}>Planejar o dia</Text>
          </Pressable>
        )}
      </View>

      <ArrowButton label="Nova tarefa" onPress={() => setForm({ mode: 'new' })} />

      {!tasks.loading && tasks.items.length === 0 && (
        <View style={styles.empty}>
          <Text style={formStyles.itemTitle}>Comece pela próxima coisa a fazer</Text>
          <Text style={formStyles.muted}>Toque em “Nova tarefa”. Depois, abra a tarefa para dividir em passos pequenos (microetapas).</Text>
        </View>
      )}

      {groups.map((g) =>
        g.key === 'done' ? (
          <View key={g.key}>
            <Pressable onPress={() => setShowDone(!showDone)} accessibilityRole="button" accessibilityState={{ expanded: showDone }} style={styles.doneToggle}>
              <Text style={formStyles.sectionTitle}>
                {GROUP_TITLE.done} ({g.tasks.length})
              </Text>
              <Text style={styles.planLinkText}>{showDone ? 'Esconder' : 'Mostrar'}</Text>
            </Pressable>
            {showDone && g.tasks.slice(0, 30).map(row)}
          </View>
        ) : (
          <View key={g.key}>
            <Text style={[formStyles.sectionTitle, g.key === 'overdue' && { color: colors.danger }]}>
              {GROUP_TITLE[g.key]} ({g.tasks.length})
            </Text>
            {g.tasks.map(row)}
          </View>
        ),
      )}

      {form && (
        <TaskFormSheet
          key={form.mode === 'edit' ? form.task.id : 'new'}
          visible
          task={form.mode === 'edit' ? form.task : null}
          onCancel={() => setForm(null)}
          onSave={(t) => void save(t)}
        />
      )}

      <Sheet
        visible={!!confirm}
        title={confirm?.kind === 'delete' ? `Apagar "${confirm.task.title}"?` : `Concluir "${confirm?.task.title ?? ''}"?`}
        confirmLabel={confirm?.kind === 'delete' ? 'Apagar' : 'Concluir'}
        danger={confirm?.kind === 'delete'}
        onCancel={() => setConfirm(null)}
        onConfirm={() => void confirmAction()}
      >
        <Text style={styles.confirmText}>
          {confirm?.kind === 'delete' ? 'As microetapas também serão apagadas. Isso não pode ser desfeito.' : confirm ? doneConfirmation(confirm.task) : ''}
        </Text>
      </Sheet>
    </Screen>
  )
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing[4], gap: spacing[3] },
  summaryText: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.textSecondary },
  planLink: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], minHeight: 44 },
  planLinkText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink, textDecorationLine: 'underline' },
  empty: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.sand, borderRadius: radius.lg, padding: spacing[4], gap: spacing[1], marginTop: spacing[5] },
  doneToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  confirmText: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.ink, textAlign: 'center' },
})
