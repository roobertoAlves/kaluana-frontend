import type { TimerSound } from './timerSession.ts'

/**
 * Catálogo dos sons da sessão de foco (RF9): nome, descrição curta e as cores
 * da "capa" desenhada na tela do player. Os arquivos são gerados pela equipe
 * (scripts/generate-noise.mjs) e vêm dentro do app.
 */
export interface SoundInfo {
  value: TimerSound
  label: string
  description: string
  /** Cores da capa: fundo e destaque. */
  art: [string, string]
  pattern: 'none' | 'waves' | 'rings' | 'dots'
}

export const SOUND_CATALOG: SoundInfo[] = [
  { value: 'BROWN', label: 'Ruído marrom', description: 'Grave e contínuo, como um rio ao longe. Bom para abafar ruídos de fundo.', art: ['#5B3A29', '#E9A66B'], pattern: 'waves' },
  { value: 'PINK', label: 'Ruído rosa', description: 'Equilibrado, como chuva fina. Suave para sessões longas.', art: ['#8E4A6B', '#F6B7C9'], pattern: 'rings' },
  { value: 'WHITE', label: 'Ruído branco', description: 'Agudo e uniforme, cobre conversas por perto.', art: ['#3E5C7A', '#E8EEF4'], pattern: 'dots' },
  { value: 'NONE', label: 'Sem som', description: 'Silêncio. Dá para escolher um som depois, na próxima sessão.', art: ['#1F3556', '#B8B0A5'], pattern: 'none' },
]

export const soundInfo = (s: TimerSound): SoundInfo => SOUND_CATALOG.find((x) => x.value === s) ?? SOUND_CATALOG[SOUND_CATALOG.length - 1]
