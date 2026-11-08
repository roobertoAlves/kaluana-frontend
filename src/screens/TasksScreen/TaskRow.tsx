import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import type { Task } from '../../types/domain'
import { CheckBox } from '../../components/motion/CheckBox'
import { FadeIn } from '../../components/motion/FadeIn'
import { ProgressBar } from '../../components/motion/ProgressBar'
import { PressableScale } from '../../components/motion/PressableScale'
import { Icon } from '../../components/ui/Icons'
import { SmallButton } from '../../components/ui/forms'
import { MAX_STEPS, stepProgress, taskMeta } from '../../features/tasks/taskModel'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

interface TaskRowProps {
  task: Task
  today: string
  index: number
  expanded: boolean
  assistantEnabled: boolean
  onToggleExpand: () => void
  onToggleDone: () => void
  onToggleStep: (stepId: string) => void
  onAddStep: (text: string) => Promise<unknown>
  onRemoveStep: (stepId: string) => void
  onFocus: () => void
  onEdit: () => void
  onDelete: () => void
  onSuggestSteps: () => Promise<string[] | null>
}

export function TaskRow(props: TaskRowProps) {
  const { task, today, index, expanded } = props
  const [newStep, setNewStep] = useState('')
  const [suggestions, setSuggestions] = useState<string[] | null>(null)
  const [suggesting, setSuggesting] = useState(false)
  const doneSteps = task.steps.filter((s) => s.done).length

  async function addStep(text: string) {
    if (!text.trim() || task.steps.length >= MAX_STEPS) return
    await props.onAddStep(text)
  }

  async function suggest() {
    setSuggesting(true)
    setSuggestions(await props.onSuggestSteps())
    setSuggesting(false)
  }

  return (
    <FadeIn index={index} style={[styles.card, task.done && styles.cardDone]}>
      <View style={styles.row}>
        <CheckBox checked={task.done} onToggle={props.onToggleDone} label={task.done ? `Reabrir ${task.title}` : `Concluir ${task.title}`} />
        <PressableScale
          onPress={props.onToggleExpand}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityHint={expanded ? 'Fecha os detalhes' : 'Abre as microetapas e as ações'}
          containerStyle={styles.titleArea}
          style={styles.titleInner}
        >
          <Text style={[styles.title, task.done && styles.titleDone]}>{task.title}</Text>
          <Text style={styles.meta}>
            {taskMeta(task, today)}
            {task.steps.length > 0 ? ` · ${doneSteps}/${task.steps.length} etapas` : ''}
          </Text>
          {!expanded && !task.done && <Text style={styles.open}>{task.steps.length === 0 ? 'Toque para dividir em microetapas' : 'Toque para ver as microetapas'}</Text>}
        </PressableScale>
      </View>
      {task.steps.length > 0 && !task.done && (
        <View style={styles.progress}>
          <ProgressBar value={stepProgress(task)} />
        </View>
      )}

      {expanded && (
        <FadeIn style={styles.details}>
          <Text style={styles.sectionLabel}>MICROETAPAS {task.steps.length > 0 ? `(${doneSteps}/${task.steps.length})` : ''}</Text>
          {task.steps.length === 0 && <Text style={styles.meta}>Passos pequenos ajudam a começar. Ex.: “abrir o caderno”.</Text>}
          {task.steps.map((s) => (
            <View key={s.id} style={styles.stepRow}>
              <CheckBox checked={s.done} onToggle={() => props.onToggleStep(s.id)} label={s.text} size={22} />
              <Text style={[styles.stepText, s.done && styles.titleDone]}>{s.text}</Text>
              <Pressable onPress={() => props.onRemoveStep(s.id)} hitSlop={12} accessibilityRole="button" accessibilityLabel={`Remover ${s.text}`}>
                <Icon name="close" size={18} color={colors.sand} />
              </Pressable>
            </View>
          ))}

          {task.steps.length < MAX_STEPS && (
            <View style={styles.addStep}>
              <TextInput
                value={newStep}
                onChangeText={setNewStep}
                placeholder="Nova microetapa (ex.: abrir o arquivo)"
                placeholderTextColor={colors.sand}
                accessibilityLabel="Nova microetapa"
                maxLength={120}
                returnKeyType="done"
                onSubmitEditing={() => addStep(newStep).then(() => setNewStep(''))}
                style={styles.input}
              />
              <Pressable
                onPress={() => addStep(newStep).then(() => setNewStep(''))}
                accessibilityRole="button"
                accessibilityLabel="Adicionar microetapa"
                style={styles.addButton}
              >
                <Icon name="plus" size={20} color={colors.white} />
              </Pressable>
            </View>
          )}

          {props.assistantEnabled && !task.done && (
            <View style={styles.assistant}>
              {!suggestions ? (
                <SmallButton label={suggesting ? 'Pensando nas etapas...' : 'Sugerir microetapas com o assistente'} onPress={suggest} />
              ) : (
                <>
                  <Text style={styles.assistantLabel}>Sugestões (toque para adicionar)</Text>
                  {suggestions.map((s) => (
                    <PressableScale key={s} onPress={() => addStep(s).then(() => setSuggestions((cur) => cur?.filter((x) => x !== s) ?? null))} style={styles.suggestion} accessibilityRole="button" accessibilityLabel={`Adicionar ${s}`}>
                      <Icon name="plus" size={16} color={colors.ink} />
                      <Text style={styles.stepText}>{s}</Text>
                    </PressableScale>
                  ))}
                  <SmallButton label="Fechar sugestões" onPress={() => setSuggestions(null)} />
                </>
              )}
            </View>
          )}

          <View style={styles.actions}>
            {!task.done && (
              <PressableScale onPress={props.onFocus} style={styles.focusButton} accessibilityRole="button" accessibilityLabel={`Focar em ${task.title}`}>
                <Icon name="timer" size={20} color={colors.white} />
                <Text style={styles.focusText}>Focar nesta tarefa</Text>
              </PressableScale>
            )}
            <View style={styles.secondaryActions}>
              <SmallButton label="Editar" onPress={props.onEdit} />
              <SmallButton label="Apagar" danger onPress={props.onDelete} />
            </View>
          </View>
        </FadeIn>
      )}
    </FadeIn>
  )
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bgSurface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.cream, padding: spacing[3], marginBottom: spacing[3] },
  cardDone: { backgroundColor: colors.bgMuted },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  titleArea: { flex: 1 },
  titleInner: { minHeight: 44, justifyContent: 'center' },
  title: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.ink },
  titleDone: { color: colors.textSecondary, textDecorationLine: 'line-through' },
  meta: { fontFamily: fonts.body, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  progress: { marginTop: spacing[2], marginLeft: 26 + spacing[3] },
  details: { marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.cream, gap: spacing[2] },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], minHeight: 44 },
  stepText: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.ink },
  addStep: { flexDirection: 'row', gap: spacing[2], alignItems: 'center' },
  input: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: colors.sand, borderRadius: radius.md, paddingHorizontal: spacing[3], fontFamily: fonts.body, fontSize: 15, color: colors.ink, backgroundColor: colors.bgSurface },
  addButton: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  assistant: { marginTop: spacing[1], gap: spacing[2] },
  assistantLabel: { fontFamily: fonts.displayMedium, fontSize: 12, color: colors.textSecondary },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: 44, paddingHorizontal: spacing[3], borderRadius: radius.md, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.sand },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing[2], marginTop: spacing[2] },
  secondaryActions: { flexDirection: 'row', gap: spacing[4] },
  open: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink },
  focusButton: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], minHeight: 48, paddingHorizontal: spacing[4], backgroundColor: colors.ink, borderRadius: radius.md },
  focusText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.white },
})
