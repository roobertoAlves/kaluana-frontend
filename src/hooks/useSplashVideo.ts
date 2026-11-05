import { useCallback, useEffect, useRef } from 'react'
import { useVideoPlayer } from 'expo-video'
import type { VideoSource } from 'expo-video'

export function useSplashVideo(source: VideoSource, onFinish: () => void) {
  const finishedRef = useRef(false)

  const finish = useCallback(() => {
    if (finishedRef.current) return
    finishedRef.current = true
    onFinish()
  }, [onFinish])

  const player = useVideoPlayer(source, (p) => {
    p.loop = false
    p.muted = false
    p.volume = 1
    p.play()
  })

  useEffect(() => {
    const endSub = player.addListener('playToEnd', finish)
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'error') finish()
    })
    return () => {
      endSub.remove()
      statusSub.remove()
    }
  }, [player, finish])

  return { player, finish }
}
