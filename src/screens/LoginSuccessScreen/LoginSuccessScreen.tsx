import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RootStackParamList } from '../../navigation/types'
import { useAuth } from '../../context/AuthContext'
import { colors, fonts, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'LoginSuccess'>

export function LoginSuccessScreen({ navigation }: Props) {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(16)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start()

    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View style={[styles.content, { opacity, transform: [{ translateY }] }]}>
        <View style={styles.mark}>
          <Text style={styles.markText}>✓</Text>
        </View>
        <Text style={styles.greeting}>{'olá,\n'}{firstName}.</Text>
        <Text style={styles.sub}>sinal recebido.</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'flex-start',
    paddingHorizontal: spacing[6],
    width: '100%',
    maxWidth: 480,
  },
  mark: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderColor: colors.emberBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
    transform: [{ rotate: '45deg' }],
  },
  markText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.emberBright,
    transform: [{ rotate: '-45deg' }],
  },
  greeting: {
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 50,
    color: colors.white,
    marginBottom: spacing[3],
  },
  sub: {
    fontFamily: fonts.displayMedium,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: colors.emberBright,
  },
})
