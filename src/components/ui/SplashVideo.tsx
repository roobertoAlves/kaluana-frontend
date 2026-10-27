import { Pressable, StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { VideoView } from 'expo-video'
import type { VideoPlayer } from 'expo-video'

interface Props {
  player: VideoPlayer
  background: string
  label: string
  onPress: () => void
  /**
   * "cover" preenche a tela inteira (pode cortar as bordas do vídeo);
   * "contain" mostra o vídeo todo e deixa faixas nas laterais ou em cima e embaixo.
   */
  fit?: 'cover' | 'contain'
}

/** Vídeo de splash em tela cheia: sem faixas e sem barra de status por cima. */
export function SplashVideo({ player, background, label, onPress, fit = 'cover' }: Props) {
  return (
    <View style={[styles.root, { backgroundColor: background }]}>
      <StatusBar hidden />
      <Pressable style={StyleSheet.absoluteFill} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
        <VideoView style={StyleSheet.absoluteFill} player={player} contentFit={fit} nativeControls={false} />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({ root: { flex: 1 } })
