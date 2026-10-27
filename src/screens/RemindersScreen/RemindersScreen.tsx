import { useEffect, useState } from 'react'
import { Alert, Switch, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { Reminder, ReminderFrequency, ReminderInsistence } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Card, ChipGroup, Field, SmallButton, formStyles } from '../../components/ui/forms'
import { useCollection } from '../../hooks/useCollection'
import { newId } from '../../services/storage'
import { cancelReminder, ensureNotificationSetup, rescheduleAll, scheduleReminder } from '../../services/notifications'
import { colors } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'>

const LEADS = [0, 5, 10, 30, 60].map((m) => ({ value: m, label: m === 0 ? 'Na hora' : `${m} min` }))
const FREQS: { value: ReminderFrequency; label: string }[] = [
  { value: 'ONCE', label: 'Uma vez' },
  { value: 'DAILY', label: 'Todo dia' },
  { value: 'WEEKLY', label: 'Toda semana' },
]
const INSIST: { value: ReminderInsistence; label: string }[] = [
  { value: 'LOW', label: 'Suave' },
  { value: 'MEDIUM', label: 'Média' },
  { value: 'HIGH', label: 'Alta' },
]
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const FREQ_LABEL = Object.fromEntries(FREQS.map((f) => [f.value, f.label.toLowerCase()]))

/** RF2: lembretes recorrentes (antecedência, frequência, insistência). */
export function RemindersScreen({ navigation, route }: Props) {
  const { items, upsert, remove, loading } = useCollection<Reminder>('reminders')
  const [editing, setEditing] = useState<Reminder | null>(null)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [lead, setLead] = useState(10)
  const [freq, setFreq] = useState<ReminderFrequency>('DAILY')
  const [insist, setInsist] = useState<ReminderInsistence>('MEDIUM')
  const [error, setError] = useState<string | null>(null)

  // Ao abrir, reagenda tudo (cobre reinício do aparelho e lembretes antigos).
  useEffect(() => {
    if (!loading) void rescheduleAll(items.filter((r) => r.enabled))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  // Cenário rápido "Beber água": abre o formulário já com o título.
  const preset = route.params?.preset
  useEffect(() => {
    if (preset) {
      startEdit(null)
      setTitle(preset)
      navigation.setParams({ preset: undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  function startEdit(r: Reminder | null) {
    setEditing(r ?? { id: newId(), title: '', time: '', leadMinutes: 10, frequency: 'DAILY', insistence: 'MEDIUM', enabled: true })
    setTitle(r?.title ?? '')
    setTime(r?.time ?? '')
    setLead(r?.leadMinutes ?? 10)
    setFreq(r?.frequency ?? 'DAILY')
    setInsist(r?.insistence ?? 'MEDIUM')
    setError(null)
  }

  async function apply(r: Reminder) {
    await upsert(r)
    try {
      if (r.enabled && !(await ensureNotificationSetup())) {
        Alert.alert('Notificações desligadas', 'Ative as notificações do Kaluanã nas configurações do aparelho para receber lembretes.')
        return
      }
      await scheduleReminder(r)
    } catch {
      Alert.alert('Não foi possível agendar', 'O lembrete foi salvo, mas o agendamento falhou. Isso pode acontecer fora de um build de desenvolvimento.')
    }
  }

  async function save() {
    if (!title.trim()) return setError('Dê um nome ao lembrete.')
    if (!TIME_RE.test(time)) return setError('Use o formato 24h, por exemplo 08:30.')
    const r: Reminder = { ...(editing as Reminder), title: title.trim(), time, leadMinutes: lead, frequency: freq, insistence: insist }
    setEditing(null)
    await apply(r)
  }

  function confirmDelete(r: Reminder) {
    Alert.alert(`Apagar "${r.title}"?`, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: async () => { await cancelReminder(r).catch(() => {}); await remove(r.id) } },
    ])
  }

  if (editing) {
    return (
      <Screen label="KALUANA · LEMBRETES" title={items.some((i) => i.id === editing.id) ? 'Editar lembrete' : 'Novo lembrete'} onBack={() => setEditing(null)}>
        <Field label="O QUE LEMBRAR" value={title} onChangeText={setTitle} maxLength={60} />
        <Field label="HORÁRIO (24H)" value={time} onChangeText={(t) => setTime(t.replace(/[^\d:]/g, '').slice(0, 5))} placeholder="08:30" keyboardType="numbers-and-punctuation" error={error} />
        <ChipGroup label="AVISAR COM ANTECEDÊNCIA DE" options={LEADS} value={lead} onChange={setLead} />
        <ChipGroup label="FREQUÊNCIA" options={FREQS} value={freq} onChange={setFreq} />
        <ChipGroup label="INSISTÊNCIA" options={INSIST} value={insist} onChange={setInsist} />
        <Text style={[formStyles.muted, { marginBottom: 16 }]}>Insistência define quantas vezes o aviso se repete se você não reagir: suave (1), média (3), alta (5).</Text>
        <ArrowButton label="Salvar lembrete" onPress={save} />
      </Screen>
    )
  }

  return (
    <Screen label="KALUANA · LEMBRETES" title="Lembretes" onBack={() => navigation.goBack()}>
      {items.length === 0 && <Text style={formStyles.muted}>Nenhum lembrete ainda.</Text>}
      {items.map((r) => (
        <Card key={r.id}>
          <View style={formStyles.row}>
            <View style={{ flex: 1 }}>
              <Text style={formStyles.itemTitle}>{r.title}</Text>
              <Text style={formStyles.muted}>
                {r.time} · {FREQ_LABEL[r.frequency]}
                {r.leadMinutes > 0 ? ` · avisa ${r.leadMinutes} min antes` : ''}
              </Text>
            </View>
            <Switch value={r.enabled} onValueChange={(v) => apply({ ...r, enabled: v })} accessibilityLabel={`Ativar ${r.title}`} trackColor={{ true: colors.emberBright }} />
          </View>
          <View style={[formStyles.row, { justifyContent: 'flex-end' }]}>
            <SmallButton label="Editar" onPress={() => startEdit(r)} />
            <SmallButton label="Apagar" danger onPress={() => confirmDelete(r)} />
          </View>
        </Card>
      ))}
      <View style={{ marginTop: 16 }}>
        <ArrowButton label="Novo lembrete" onPress={() => startEdit(null)} />
      </View>
    </Screen>
  )
}
