import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { BottomMenu } from '../../components/ui/BottomMenu'
import { useAuth } from '../../context/AuthContext'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

const CARDS = [
  { title: 'Progresso', text: 'Acompanhe sua evolução.' },
  { title: 'Exercícios', text: 'Acesse suas atividades.' },
  { title: 'Mensagens', text: 'Fale com seu terapeuta.' },
  { title: 'Dicas', text: 'Leia conteúdos úteis.' },
]

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: spacing[5] + insets.top }]}>
        <View style={styles.content}>
          <Text style={styles.label}>KALUANA · INÍCIO</Text>
          <Text accessibilityRole="header" style={styles.title}>
            {'olá,\n'}{user?.name?.split(' ')[0] ?? ''}.
          </Text>

          <View style={styles.grid}>
            {CARDS.map((card) => (
              <View key={card.title} style={styles.card}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardText}>{card.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <BottomMenu
        active="inicio"
        onNavigate={(tab) => {
          if (tab === 'perfil') navigation.navigate('Profile')
          if (tab === 'configuracoes') navigation.navigate('Settings')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPage,
  },
  scroll: {
    padding: spacing[5],
    paddingBottom: spacing[5],
  },
  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  label: {
    fontFamily: fonts.displayMedium,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.emberBright,
    marginBottom: spacing[2],
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 42,
    color: colors.ink,
    marginBottom: spacing[6],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  card: {
    width: '47%',
    backgroundColor: colors.bgSurface,
    padding: spacing[4],
    borderRadius: 2,
    borderLeftWidth: 2,
    borderLeftColor: colors.emberBright,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.ink,
    marginBottom: 4,
  },
  cardText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textSecondary,
  },
})
