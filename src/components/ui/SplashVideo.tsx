import { Pressable, StyleSheet, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { VideoView } from 'expo-video'
import type { VideoPlayer } from 'expo-video'

interface Props {
  player: VideoPlayer
  background: string
  label: string
  onPress: () => void
  fit?: 'cover' | 'contain'
}

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
