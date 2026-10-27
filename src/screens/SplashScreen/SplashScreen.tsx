import { useCallback } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { useSplashVideo } from '../../hooks/useSplashVideo'
import { SplashVideo } from '../../components/ui/SplashVideo'

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>

const VIDEO_BACKGROUND = '#DFDACF'

/**
 * Splash padrão, usada em todas as aberturas depois da primeira. Toca o
 * vídeo uma vez, com som, em tela cheia, e segue para a escolha de perfil
 * quando termina (ou ao toque).
 */
export function SplashScreen({ navigation }: Props) {
  const goNext = useCallback(() => navigation.replace('ProfileSelection'), [navigation])
  const { player, finish } = useSplashVideo(require('../../../assets/splash/splashscreen.mp4'), goNext)
  return <SplashVideo player={player} background={VIDEO_BACKGROUND} label="Toque para continuar" onPress={finish} />
}
