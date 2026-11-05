import { useState } from 'react'
import { Alert, Linking, Pressable, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { ContactMethod, TrustedContact } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { ArrowButton } from '../../components/ui/ArrowButton'
import { Card, ChipGroup, Field, SmallButton, formStyles } from '../../components/ui/forms'
import { useCollection } from '../../hooks/useCollection'
import { newId } from '../../services/storage'
import { contactsSource } from '../../services/contactsApi'

type Props = NativeStackScreenProps<RootStackParamList, 'Contacts'>

const METHODS: { value: ContactMethod; label: string }[] = [
  { value: 'LIGACAO', label: 'Ligação' },
  { value: 'MENSAGEM', label: 'Mensagem' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'EMAIL', label: 'E-mail' },
]
const METHOD_LABEL = Object.fromEntries(METHODS.map((m) => [m.value, m.label])) as Record<ContactMethod, string>

function urlFor(c: TrustedContact): string {
  const digits = c.value.replace(/\D/g, '')
  switch (c.method) {
    case 'LIGACAO':
      return `tel:${digits}`
    case 'MENSAGEM':
      return `sms:${digits}`
    case 'WHATSAPP':
      return `https://wa.me/${digits.startsWith('55') ? digits : `55${digits}`}`
    case 'EMAIL':
      return `mailto:${c.value.trim()}`
  }
}

export function ContactsScreen({ navigation }: Props) {
  const { items, add, remove, error: apiError } = useCollection<TrustedContact>(contactsSource)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [method, setMethod] = useState<ContactMethod>('WHATSAPP')
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function save() {
    const v = value.trim()
    const valid = method === 'EMAIL' ? /^\S+@\S+\.\S+$/.test(v) : v.replace(/\D/g, '').length >= 10
    if (!name.trim()) return setError('Informe um nome.')
    if (!valid) return setError(method === 'EMAIL' ? 'E-mail inválido.' : 'Informe o telefone com DDD.')
    if (!(await add({ id: newId(), name: name.trim(), method, value: v }))) return
    setName('')
    setValue('')
    setError(null)
    setAdding(false)
  }

  async function open(c: TrustedContact) {
    try {
      await Linking.openURL(urlFor(c))
    } catch {
      Alert.alert('Não foi possível abrir', `Tente ${METHOD_LABEL[c.method].toLowerCase()} manualmente: ${c.value}`)
    }
  }

  function confirmDelete(c: TrustedContact) {
    Alert.alert(`Remover ${c.name}?`, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => void remove(c.id) },
    ])
  }

  return (
    <Screen label="KALUANA · CONTATOS" title="Contatos de confiança" onBack={() => navigation.goBack()} error={apiError}>
      {items.length === 0 && !adding && <Text style={formStyles.muted}>Adicione pessoas com quem você quer falar quando precisar.</Text>}

      {items.map((c) => (
        <Card key={c.id}>
          <Pressable onPress={() => open(c)} accessibilityRole="button" accessibilityLabel={`${METHOD_LABEL[c.method]} para ${c.name}`}>
            <Text style={formStyles.itemTitle}>{c.name}</Text>
            <Text style={formStyles.muted}>
              {METHOD_LABEL[c.method]} · {c.value}
            </Text>
          </Pressable>
          <View style={{ alignItems: 'flex-end' }}>
            <SmallButton label="Remover" danger onPress={() => confirmDelete(c)} />
          </View>
        </Card>
      ))}

      {adding ? (
        <View style={{ marginTop: 16 }}>
          <Field label="NOME" value={name} onChangeText={setName} autoCapitalize="words" />
          <ChipGroup label="FORMA PREFERIDA" options={METHODS} value={method} onChange={setMethod} />
          <Field
            label={method === 'EMAIL' ? 'E-MAIL' : 'TELEFONE COM DDD'}
            value={value}
            onChangeText={setValue}
            keyboardType={method === 'EMAIL' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
            error={error}
          />
          <ArrowButton label="Salvar contato" onPress={save} />
          <SmallButton label="Cancelar" onPress={() => { setAdding(false); setError(null) }} />
        </View>
      ) : (
        <View style={{ marginTop: 16 }}>
          <ArrowButton label="Adicionar contato" variant="secondary" onPress={() => setAdding(true)} />
        </View>
      )}
    </Screen>
  )
}
