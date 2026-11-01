import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/**
 * RNF8: true quando o sistema pede menos movimento. Todo componente animado
 * consulta isto e, nesse caso, mostra o estado final sem transição.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    let alive = true
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => alive && setReduced(v))
      .catch(() => {})
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => {
      alive = false
      sub.remove()
    }
  }, [])

  return reduced
}

/** Durações curtas e fixas (RNF8): nada passa de 260 ms. */
export const motion = {
  fast: 140,
  base: 220,
  slow: 260,
  /** Atraso entre itens de uma lista que entra em cascata. Limitado a 6 itens. */
  stagger: 40,
  maxStaggered: 6,
} as const
