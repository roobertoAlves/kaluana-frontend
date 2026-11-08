import { useState } from 'react'
import { Alert, Switch, Text, TextInput, View, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { EventCategory, LifeEvent } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Card, ChipGroup, SmallButton, formStyles } from '../../components/ui/forms'
import { useCollection } from '../../hooks/useCollection'
import { newId } from '../../services/storage'
import { eventsSource } from '../../services/eventsApi'
import { CATEGORY_LABEL } from '../../features/reports/buildReport'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'EventLog'>

const CATEGORIES = (Object.keys(CATEGORY_LABEL) as EventCategory[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))

export function EventLogScreen({ navigation }: Props) {
  const { items, add, remove, error } = useCollection<LifeEvent>(eventsSource)
  const [category, setCategory] = useState<EventCategory>('SOBRECARGA')
  const [text, setText] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    const created = await add({ id: newId(), category, text: text.trim() || undefined, urgent, timestamp: new Date().toISOString() })
    if (!created) return
    setText('')
    setUrgent(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function confirmDelete(id: string) {
    Alert.alert('Apagar registro?', 'Isso não pode ser desfeito.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => void remove(id) },
    ])
  }

  return (
    <Screen label="KALUANA · EVENTOS" title="Registrar evento" onBack={() => navigation.goBack()} error={error}>
      <ChipGroup label="O QUE ACONTECEU?" options={CATEGORIES} value={category} onChange={setCategory} />

      <Text style={s.fieldLabel}>NOTA (OPCIONAL)</Text>
      <TextInput
        accessibilityLabel="Nota opcional"
        multiline
        value={text}
        onChangeText={setText}
        maxLength={280}
        placeholder="Se quiser, escreva em poucas palavras"
        placeholderTextColor={colors.sand}
        style={s.input}
      />

      <View style={[formStyles.row, { marginVertical: spacing[4] }]}>
        <Text style={formStyles.itemTitle}>Marcar como urgente</Text>
        <Switch value={urgent} onValueChange={setUrgent} accessibilityLabel="Marcar como urgente" trackColor={{ true: colors.emberBright }} />
      </View>

      <ArrowButton label={saved ? 'Registrado ✓' : 'Registrar'} onPress={save} />

      <Text style={formStyles.sectionTitle}>RECENTES</Text>
      {items.length === 0 && <Text style={formStyles.muted}>Nenhum evento ainda.</Text>}
      {items.slice(0, 20).map((e) => (
        <Card key={e.id}>
          <View style={formStyles.row}>
            <Text style={formStyles.itemTitle}>
              {CATEGORY_LABEL[e.category]}
              {e.urgent ? ' · urgente' : ''}
            </Text>
            <SmallButton label="Apagar" danger onPress={() => confirmDelete(e.id)} />
          </View>
          <Text style={formStyles.muted}>{new Date(e.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</Text>
          {e.text ? <Text style={[formStyles.muted, { color: colors.ink, marginTop: spacing[1] }]}>{e.text}</Text> : null}
        </Card>
      ))}
    </Screen>
  )
}

const s = StyleSheet.create({
  fieldLabel: { fontFamily: fonts.displayMedium, fontSize: 11, letterSpacing: 1.2, color: colors.ink, marginBottom: spacing[2] },
  input: { minHeight: 96, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.sand, borderRadius: radius.sm, backgroundColor: colors.bgSurface, padding: spacing[3], fontFamily: fonts.body, fontSize: 16, color: colors.ink },
})
