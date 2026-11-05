import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import type { SoundInfo } from '../../features/timer/sounds'

export function SoundArt({ info, size }: { info: SoundInfo; size: number }) {
  const [bg, accent] = info.art
  const id = `g-${info.value}`
  const waves = [0.35, 0.5, 0.65].map((y, i) => {
    const h = size * y
    const a = size * (0.06 + i * 0.02)
    return `M0 ${h} Q ${size * 0.25} ${h - a} ${size * 0.5} ${h} T ${size} ${h}`
  })
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={bg} />
          <Stop offset="1" stopColor={accent} stopOpacity={0.55} />
        </LinearGradient>
      </Defs>
      <Rect width={size} height={size} rx={size * 0.08} fill={`url(#${id})`} />
      {info.pattern === 'waves' && waves.map((d, i) => <Path key={i} d={d} stroke={accent} strokeWidth={size * 0.025} fill="none" opacity={0.9 - i * 0.2} />)}
      {info.pattern === 'rings' &&
        [0.12, 0.22, 0.32, 0.42].map((r, i) => <Circle key={i} cx={size / 2} cy={size / 2} r={size * r} stroke={accent} strokeWidth={size * 0.02} fill="none" opacity={1 - i * 0.2} />)}
      {info.pattern === 'dots' &&
        Array.from({ length: 36 }, (_, i) => (
          <Circle key={i} cx={(size / 7) * ((i % 6) + 1)} cy={(size / 7) * (Math.floor(i / 6) + 1)} r={size * (0.012 + ((i * 7) % 5) * 0.004)} fill={accent} opacity={0.85} />
        ))}
      {info.pattern === 'none' && <Path d={`M${size * 0.3} ${size * 0.7} L${size * 0.7} ${size * 0.3}`} stroke={accent} strokeWidth={size * 0.03} strokeLinecap="round" />}
    </Svg>
  )
}
