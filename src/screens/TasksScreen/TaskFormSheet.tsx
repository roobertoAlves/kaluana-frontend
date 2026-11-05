import { useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import type { Task, TaskPriority } from '../../types/domain'
import { Sheet } from '../../components/ui/pickers/Sheet'
import { DateField, DurationField } from '../../components/ui/pickers/fields'
import { ChipGroup } from '../../components/ui/forms'
import { Icon } from '../../components/ui/Icons'
import { MAX_STEPS } from '../../features/tasks/taskModel'
import { formatDay } from '../../features/time/timeValues'
import { newId } from '../../services/storage'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Baixa' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]
type When = 'today' | 'tomorrow' | 'pick' | 'none'
const WHEN: { value: When; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'tomorrow', label: 'Amanhã' },
  { value: 'pick', label: 'Outro dia' },
  { value: 'none', label: 'Sem data' },
]

const dayFromNow = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return formatDay(d)
}

function whenOf(due: string | null): When {
  if (!due) return 'none'
  if (due === dayFromNow(0)) return 'today'
  return due === dayFromNow(1) ? 'tomorrow' : 'pick'
}

interface Props {
  visible: boolean
  task?: Task | null
  onCancel: () => void
  onSave: (task: Task) => void
}

export function TaskFormSheet({ visible, task, onCancel, onSave }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM')
  const [knowsTime, setKnowsTime] = useState(!!task?.estimatedMinutes)
  const [minutes, setMinutes] = useState(task?.estimatedMinutes ?? 25)
  const [when, setWhen] = useState<When>(task ? whenOf(task.dueDate) : 'today')
  const [picked, setPicked] = useState(task?.dueDate ?? dayFromNow(2))
  const [steps, setSteps] = useState<string[]>([])
  const [newStep, setNewStep] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dueDate = when === 'none' ? null : when === 'today' ? dayFromNow(0) : when === 'tomorrow' ? dayFromNow(1) : picked

  function addStep() {
    const text = newStep.trim()
    if (!text || steps.length >= MAX_STEPS) return
    setSteps([...steps, text.slice(0, 120)])
    setNewStep('')
  }

  function save() {
    if (!title.trim()) {
      setError('Dê um nome para a tarefa.')
      return
    }
    onSave({
      id: task?.id ?? newId(),
      title: title.trim().slice(0, 120),
      priority,
      estimatedMinutes: knowsTime ? minutes : null,
      dueDate,
      done: task?.done ?? false,
      completedAt: task?.completedAt ?? null,
      steps: task ? task.steps : steps.map((text) => ({ id: newId(), text, done: false })),
    })
  }

  return (
    <Sheet visible={visible} title={task ? 'Editar tarefa' : 'Nova tarefa'} confirmLabel={task ? 'Salvar' : 'Criar tarefa'} onCancel={onCancel} onConfirm={save} scroll>
      <Text style={styles.label}>O QUE VOCÊ PRECISA FAZER?</Text>
      <TextInput
        value={title}
        onChangeText={(t) => {
          setTitle(t)
          setError(null)
        }}
        placeholder="Ex.: estudar para a prova"
        placeholderTextColor={colors.sand}
        accessibilityLabel="Nome da tarefa"
        maxLength={120}
        autoFocus={!task}
        style={[styles.input, error && styles.inputError]}
      />
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <View style={styles.space} />
      <ChipGroup label="PRIORIDADE" options={PRIORITIES} value={priority} onChange={setPriority} />

      <ChipGroup label="QUANDO" options={WHEN} value={when} onChange={setWhen} />
      {when === 'pick' && <DateField label="DATA" value={picked} onChange={setPicked} minimumDate={new Date()} />}

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>Sei quanto tempo leva</Text>
          <Text style={styles.muted}>Ajuda o plano do dia a encaixar a tarefa.</Text>
        </View>
        <Switch value={knowsTime} onValueChange={setKnowsTime} accessibilityLabel="Sei quanto tempo leva" trackColor={{ true: colors.emberBright }} />
      </View>
      {knowsTime && <DurationField label="QUANTO TEMPO LEVA" minutes={minutes} onChange={setMinutes} min={5} max={480} />}

      {!task && (
        <>
          <Text style={styles.label}>MICROETAPAS (OPCIONAL)</Text>
          {steps.map((s, i) => (
            <View key={`${s}-${i}`} style={styles.step}>
              <Text style={styles.stepText}>
                {i + 1}. {s}
              </Text>
              <Pressable onPress={() => setSteps(steps.filter((_, j) => j !== i))} hitSlop={12} accessibilityRole="button" accessibilityLabel={`Remover ${s}`}>
                <Icon name="close" size={18} color={colors.sand} />
              </Pressable>
            </View>
          ))}
          {steps.length < MAX_STEPS && (
            <View style={styles.addRow}>
              <TextInput
                value={newStep}
                onChangeText={setNewStep}
                placeholder="Ex.: separar o material"
                placeholderTextColor={colors.sand}
                accessibilityLabel="Nova microetapa"
                maxLength={120}
                returnKeyType="done"
                onSubmitEditing={addStep}
                style={[styles.input, { flex: 1 }]}
              />
              <Pressable onPress={addStep} accessibilityRole="button" accessibilityLabel="Adicionar microetapa" style={styles.addButton}>
                <Icon name="plus" size={20} color={colors.white} />
              </Pressable>
            </View>
          )}
        </>
      )}
    </Sheet>
  )
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink, marginBottom: spacing[2] },
  input: { minHeight: 52, borderWidth: 1.5, borderColor: colors.ink, borderRadius: radius.md, paddingHorizontal: spacing[4], fontFamily: fonts.body, fontSize: 17, color: colors.ink, backgroundColor: colors.bgSurface },
  inputError: { borderColor: colors.danger },
  error: { fontFamily: fonts.body, fontSize: 13, color: colors.danger, marginTop: spacing[1] },
  space: { height: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[4] },
  rowTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  muted: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: 44 },
  stepText: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  addButton: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
})
