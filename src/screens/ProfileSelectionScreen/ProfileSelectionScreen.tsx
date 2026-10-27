import { ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { CornerMarks } from '../../components/ui/CornerMarks'
import { DiagonalOption } from '../../components/ui/DiagonalOption'
import { DotGrid } from '../../components/ui/DotGrid'
import { SignalMark } from '../../components/SignalMark'
import { colors, fonts, maxWidthScreen } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileSelection'>

export function ProfileSelectionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets()

  const options = [
    {
      number: '01',
      title: 'Registrar',
      description: 'criar uma conta nova',
      color: colors.emberBright,
      onPress: () => navigation.navigate('PrimaryRegister'),
    },
    {
      number: '02',
      title: 'Entrar',
      description: 'já tenho uma conta',
      color: colors.ink,
      onPress: () => navigation.navigate('Login'),
    },
    {
      number: '03',
      title: 'Emparelhar',
      description: 'sou responsável ou parceiro de alguém',
      color: colors.darkWedge,
      onPress: () => navigation.navigate('ResponsibleRegister'),
    },
  ]

  return (
    <View style={styles.root}>
      <ScrollView bounces={false} overScrollMode="never" contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.screen}>
          <DotGrid />
          <CornerMarks />

          <View style={[styles.hero, { paddingTop: 80 + insets.top }]}>
            <View style={[styles.seal, { top: 40 + insets.top }]}>
              <SignalMark size={64} />
            </View>
            <Text accessibilityRole="header" style={styles.heroTitle}>
              {'por onde\nvocê quer\ncomeçar?'}
            </Text>
            <Text style={styles.heroDesc}>Sem pressa. Cada caminho chega no mesmo lugar.</Text>
          </View>

          <View style={[styles.options, { paddingBottom: 48 + insets.bottom }]}>
            {options.map((option, index) => (
              <DiagonalOption
                key={option.number}
                index={index}
                number={option.number}
                title={option.title}
                description={option.description}
                color={option.color}
                onPress={option.onPress}
                onPressNext={options[index + 1]?.onPress}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  scrollContent: {
    flexGrow: 1,
  },
  screen: {
    flexGrow: 1,
    width: '100%',
    maxWidth: maxWidthScreen,
    alignSelf: 'center',
    backgroundColor: colors.paper,
    overflow: 'hidden',
  },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    zIndex: 5,
  },
  seal: {
    position: 'absolute',
    right: 20,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 41.6,
    lineHeight: 43.7,
    color: colors.ink,
    marginBottom: 12,
  },
  heroDesc: {
    fontFamily: fonts.body,
    fontSize: 14.4,
    color: colors.inkSoft,
  },
  options: {
    marginTop: 16,
  },
})
