import { colors } from './tokens'

/**
 * Temas (variáveis "Kaluana Tema" do Figma). O CLARO é o que está em uso.
 * O ESCURO fica reservado: mesmos nomes, ainda não ligado a nenhuma tela.
 * Para ativar no futuro, as telas passam a ler `useTheme()` em vez de `colors`.
 */
export interface Theme {
  bg: string
  surface: string
  muted: string
  text: string
  textSecondary: string
  accent: string
  line: string
}

export const lightTheme: Theme = {
  bg: colors.bgPage,
  surface: colors.bgSurface,
  muted: colors.bgMuted,
  text: colors.ink,
  textSecondary: colors.textSecondary,
  accent: colors.emberBright,
  line: colors.cream,
}

/** Reservado: valores provisórios, a definir com o Figma ("Kaluana Tema · Escuro"). */
export const darkTheme: Theme = {
  bg: '#152840',
  surface: '#1F3556',
  muted: '#234E70',
  text: '#FFF9F2',
  textSecondary: '#B8B0A5',
  accent: colors.emberLight,
  line: '#234E70',
}

export const theme = lightTheme
