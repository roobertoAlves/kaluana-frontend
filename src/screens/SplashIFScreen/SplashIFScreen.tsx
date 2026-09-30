import { useCallback, useEffect } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { VideoView } from 'expo-video'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import { useSplashVideo } from '../../hooks/useSplashVideo'
import { markIntroSeen } from '../../services/introFlag'

type Props = NativeStackScreenProps<RootStackParamList, 'SplashIF'>

// Cor das bordas do vídeo, para as faixas de cima/baixo (contentFit "contain")
// se fundirem com a imagem em telas mais altas que 9:16.
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

  return (
    <Pressable
      style={styles.wrapper}
      onPress={finish}
      accessibilityRole="button"
      accessibilityLabel="Toque para pular a abertura"
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
