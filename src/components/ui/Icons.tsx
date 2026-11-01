import Svg, { Circle, Path, Rect } from 'react-native-svg'

export type IconName =
  | 'check' | 'timer' | 'bell' | 'note' | 'compass' | 'pin' | 'drop' | 'pencil' | 'mail'
  | 'user' | 'globe' | 'chevron' | 'gear' | 'shield' | 'people' | 'doc' | 'palette'
  | 'list' | 'calendar' | 'sound' | 'plus' | 'close' | 'sparkle'

/** Ícones de linha simples (24x24). Troque pelos do Figma quando exportados. */
export function Icon({ name, size = 24, color = '#1F3556' }: { name: IconName; size?: number; color?: string }) {
  const p = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no">
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />}
      {name === 'timer' && (<><Circle cx={12} cy={13} r={8} {...p} /><Path d="M12 9v4l2.5 2M9 3h6" {...p} /></>)}
      {name === 'bell' && <Path d="M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15zM10 21h4" {...p} />}
      {(name === 'note' || name === 'doc') && <Path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7" {...p} />}
      {name === 'compass' && (<><Circle cx={12} cy={12} r={9} {...p} /><Path d="M15.5 8.5l-2 5-5 2 2-5z" {...p} /></>)}
      {name === 'pin' && (<><Path d="M12 21s7-6.2 7-11a7 7 0 1 0 -14 0c0 4.8 7 11 7 11z" {...p} /><Circle cx={12} cy={10} r={2.5} {...p} /></>)}
      {name === 'drop' && <Path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" {...p} />}
      {name === 'pencil' && <Path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3" {...p} />}
      {name === 'mail' && (<><Rect x={3} y={5} width={18} height={14} rx={1} {...p} /><Path d="M3 7l9 6 9-6" {...p} /></>)}
      {name === 'user' && (<><Circle cx={12} cy={8} r={4} {...p} /><Path d="M4 21c0-4 4-6 8-6s8 2 8 6" {...p} /></>)}
      {name === 'globe' && (<><Circle cx={12} cy={12} r={9} {...p} /><Path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" {...p} /></>)}
      {name === 'chevron' && <Path d="M9 6l6 6-6 6" {...p} />}
      {name === 'gear' && (<><Circle cx={12} cy={12} r={3} {...p} /><Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" {...p} /></>)}
      {name === 'shield' && <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" {...p} />}
      {name === 'people' && (<><Circle cx={9} cy={9} r={3} {...p} /><Path d="M3 20c0-3.5 3-5 6-5s6 1.5 6 5M16 6a3 3 0 0 1 0 6M18 15c2 .7 3 2.3 3 5" {...p} /></>)}
      {name === 'list' && <Path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18h2" {...p} />}
      {name === 'calendar' && (<><Rect x={3} y={5} width={18} height={16} rx={1} {...p} /><Path d="M3 10h18M8 3v4M16 3v4M7 14h4M7 17h7" {...p} /></>)}
      {name === 'sound' && <Path d="M4 10v4h4l5 4V6L8 10zM16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" {...p} />}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...p} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6L6 18" {...p} />}
      {name === 'sparkle' && <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7z" {...p} />}
      {name === 'palette' && (<><Circle cx={12} cy={12} r={9} {...p} /><Circle cx={8.5} cy={10} r={1} fill={color} /><Circle cx={12} cy={7.5} r={1} fill={color} /><Circle cx={15.5} cy={10} r={1} fill={color} /></>)}
    </Svg>
  )
}
