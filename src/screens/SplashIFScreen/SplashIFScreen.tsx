import { useCallback, useEffect } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { useSplashVideo } from '../../hooks/useSplashVideo'
import { markIntroSeen } from '../../services/introFlag'
import { SplashVideo } from '../../components/ui/SplashVideo'

type Props = NativeStackScreenProps<RootStackParamList, 'SplashIF'>

const VIDEO_BACKGROUND = '#DAD6CB'

/**
 * Splash do IF: só aparece na primeira abertura do app. O flag é gravado
 * assim que a tela abre, então nem fechar o app no meio do vídeo a repete.
 * Ao terminar (ou ao tocar), vai direto para a escolha de perfil.
 */
export function SplashIFScreen({ navigation }: Props) {
  useEffect(() => {
    markIntroSeen()
  }, [])

  const goNext = useCallback(() => navigation.replace('ProfileSelection'), [navigation])
  const { player, finish } = useSplashVideo(require('../../../assets/splash/splashscreen-if.mp4'), goNext)
  return <SplashVideo player={player} background={VIDEO_BACKGROUND} label="Toque para pular a abertura" onPress={finish} />
}
