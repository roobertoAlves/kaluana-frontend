import { useCallback } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { VideoView } from 'expo-video'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { useSplashVideo } from '../../hooks/useSplashVideo'

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>

const VIDEO_BACKGROUND = '#DFDACF'

/**
 * Splash padrão, usada em todas as aberturas depois da primeira. Toca o
 * vídeo uma vez, com som, e segue para a escolha de perfil quando termina
 * (ou ao toque).
 */
export function SplashScreen({ navigation }: Props) {
  const goNext = useCallback(() => navigation.replace('ProfileSelection'), [navigation])
  const { player, finish } = useSplashVideo(require('../../../assets/splash/splashscreen.mp4'), goNext)

  return (
    <Pressable
      style={styles.wrapper}
      onPress={finish}
      accessibilityRole="button"
      accessibilityLabel="Toque para continuar"
    >
      <VideoView
        style={StyleSheet.absoluteFill}
        player={player}
        contentFit="contain"
        nativeControls={false}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: VIDEO_BACKGROUND,
  },
})
