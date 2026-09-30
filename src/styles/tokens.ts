/**
 * Tokens visuais do Atlas de Sinais, espelhando 1:1 o src/styles/tokens.css
 * do kaluana-frontend-base (mesma paleta, mesma escala de espaçamento).
 */

export const colors = {
  ink: '#1F3556',
  inkSoft: '#234E70',
  ember: '#C95D2B',
  emberBright: '#E9782D',
  emberLight: '#F39A4A',
  sage: '#7A9E7E',
  sageBright: '#7DAA84',
  sand: '#B8B0A5',
  cream: '#F6F1EA',
  paper: '#FFF9F2',

  signalBlue: '#3E7BCE',
  signalYellow: '#F2C94C',
  signalRed: '#E85A4F',
  signalOrange: '#E9782D',

  bgPage: '#FFF9F2',
  bgSurface: '#FFFFFF',
  bgMuted: '#F6F1EA',
  textPrimary: '#1F3556',
  textSecondary: '#234E70',
  textMuted: '#B8B0A5',
  danger: '#E85A4F',
  success: '#7DAA84',

  /** Terceiro bloco da tela "por onde você quer começar?". */
  darkWedge: '#152840',
  white: '#FFFFFF',

  /** Cores usadas só na Home e no BottomMenu do projeto base. */
  homeBackground: '#F8F9FA',
  homeText: '#333333',
  homeTextMuted: '#666666',
  menuBorder: '#EAEAEA',
  menuInactive: '#888888',
  menuActive: '#007AFF',
} as const

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 48,
  8: 64,
} as const

export const radius = {
  sm: 2,
  md: 4,
  lg: 8,
} as const

export const maxWidthScreen = 480

/** Mesmas famílias do projeto base, carregadas via expo-font em App.tsx. */
export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'AtkinsonHyperlegible_400Regular',
  bodyItalic: 'AtkinsonHyperlegible_400Regular_Italic',
  bodyBold: 'AtkinsonHyperlegible_700Bold',
}
