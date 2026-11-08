import type { TimerSound } from './timerSession.ts'

export interface SoundInfo {
  value: TimerSound
  label: string
  description: string
  art: [string, string]
  pattern: 'none' | 'waves' | 'rings' | 'dots'
}

export const SOUND_CATALOG: SoundInfo[] = [
  { value: 'BROWN', label: 'Ruído marrom', description: 'Grave e contínuo, como um rio ao longe. Bom para abafar ruídos de fundo.', art: ['#5B3A29', '#E9A66B'], pattern: 'waves' },
  { value: 'PINK', label: 'Ruído rosa', description: 'Equilibrado, como chuva fina. Suave para sessões longas.', art: ['#8E4A6B', '#F6B7C9'], pattern: 'rings' },
  { value: 'WHITE', label: 'Ruído branco', description: 'Agudo e uniforme, cobre conversas por perto.', art: ['#3E5C7A', '#E8EEF4'], pattern: 'dots' },
    { value: 'RAIN', label: 'Chuva', description: 'Chuva fina e constante. Ajuda a desligar do barulho de fora.', art: ['#2F4858', '#9CC5D9'], pattern: 'dots' },
  { value: 'WAVES', label: 'Ondas', description: 'Mar calmo, vai e vem lento. Ritmo para respirar junto.', art: ['#1D4E89', '#7FC8D6'], pattern: 'waves' },
  { value: 'FIRE', label: 'Lareira', description: 'Estalos suaves de lenha. Aconchegante para tarefas tranquilas.', art: ['#6B2D1A', '#F39A4A'], pattern: 'rings' },
  { value: 'FOREST', label: 'Floresta', description: 'Vento leve nas folhas. Um fundo vivo, sem palavras.', art: ['#2E4A2F', '#9FC88F'], pattern: 'waves' },
  { value: 'NONE', label: 'Sem som', description: 'Silêncio. Dá para escolher um som depois, na próxima sessão.', art: ['#1F3556', '#B8B0A5'], pattern: 'none' },
]

export const soundInfo = (s: TimerSound): SoundInfo => SOUND_CATALOG.find((x) => x.value === s) ?? SOUND_CATALOG[SOUND_CATALOG.length - 1]
