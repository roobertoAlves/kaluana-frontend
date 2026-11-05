import { useCallback, useEffect } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { useSplashVideo } from '../../hooks/useSplashVideo'
import { markIntroSeen } from '../../services/introFlag'
import { SplashVideo } from '../../components/ui/SplashVideo'

type Props = NativeStackScreenProps<RootStackParamList, 'SplashIF'>

const VIDEO_BACKGROUND = '#DAD6CB'

export function SplashIFScreen({ navigation }: Props) {
  useEffect(() => {
    markIntroSeen()
  }, [])

  const goNext = useCallback(() => navigation.replace('ProfileSelection'), [navigation])
  const { player, finish } = useSplashVideo(require('../../../assets/splash/splashscreen-if.mp4'), goNext)
  return <SplashVideo player={player} background={VIDEO_BACKGROUND} label="Toque para pular a abertura" onPress={finish} />
}
