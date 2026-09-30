import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BottomMenu } from '../../components/BottomMenu/BottomMenu'
import { colors, fonts } from '../../styles/tokens'

const CARDS = [
  { title: 'Meu Progresso', text: 'Acompanhe sua evolução.' },
  { title: 'Exercícios', text: 'Acesse suas atividades.' },
  { title: 'Mensagens', text: 'Fale com seu terapeuta.' },
  { title: 'Dicas', text: 'Leia conteúdos úteis.' },
]

export function HomeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: 20 + insets.top }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.headerTitle}>
              Bem-vindo ao Kaluana
            </Text>
            <Text style={styles.headerText}>Sua jornada começa aqui.</Text>
          </View>

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
      <BottomMenu />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.homeBackground,
  },
  scroll: {
    padding: 20,
    paddingBottom: 24,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.homeText,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.homeTextMuted,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.homeText,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.homeTextMuted,
    textAlign: 'center',
  },
})
