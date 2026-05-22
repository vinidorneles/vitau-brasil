/**
 * VitaU — sistema de design "Bem-estar Acolhedor".
 * App de saúde integral para universitários.
 * Paleta quente (creme + verde-pinheiro), tipografia Fraunces + Plus Jakarta Sans.
 */
import type { TextStyle } from 'react-native';

export const colors = {
  // fundos
  bg: '#F3EDE1', // creme quente — assinatura visual do app
  bgDeep: '#ECE2D0', // creme mais profundo p/ camadas
  surface: '#FFFFFF', // cartões
  surfaceAlt: '#FBF7EF', // superfície interna quente
  surfaceSunk: '#F2ECDF', // caixas "afundadas"

  // tinta / texto
  ink: '#1C2B25', // texto principal (verde-tinta quase preto)
  inkSoft: '#5D6C64', // texto secundário
  inkFaint: '#9AA69D', // texto terciário / captions

  // verde primário
  primary: '#1E5A49',
  primaryBright: '#2C7058',
  primaryDeep: '#103A2F',
  primarySoft: '#DCE8E1', // tinte de fundo
  primaryTint: '#E9F0EB',

  // acentos quentes
  clay: '#DC7656', // terracota
  claySoft: '#F7E1D7',
  honey: '#E2A23E', // mel / âmbar
  honeySoft: '#F8E9CB',
  indigo: '#475283', // sono
  indigoSoft: '#E3E3F0',

  // semântico
  danger: '#C5563E',
  success: '#3C8B5E',
  warning: '#D2982E',

  // bordas
  border: '#E6DCC9', // borda quente sobre creme
  hairline: '#EEE9DD', // divisória dentro de cartões
  white: '#FFFFFF',
};

/** Gradientes (tuplas para expo-linear-gradient). */
export const gradients = {
  brand: ['#2C7058', '#16493B'] as const,
  brandDeep: ['#1E5A49', '#0F332A'] as const,
  clay: ['#E68C68', '#D26B4B'] as const,
  honey: ['#ECB459', '#DD9329'] as const,
  indigo: ['#5C68A0', '#3C4673'] as const,
  cream: ['#F7F1E4', '#EBE0CC'] as const,
};

/** Famílias de fonte (carregadas em App.tsx via expo-font). */
export const fonts = {
  serifReg: 'Fraunces_400Regular',
  serifItalic: 'Fraunces_400Regular_Italic',
  serifMed: 'Fraunces_500Medium',
  serif: 'Fraunces_600SemiBold',
  serifBold: 'Fraunces_700Bold',
  serifBlack: 'Fraunces_900Black',
  sans: 'PlusJakartaSans_400Regular',
  sansMed: 'PlusJakartaSans_500Medium',
  sansSemi: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
  sansExtra: 'PlusJakartaSans_800ExtraBold',
};

/** Escala de humor 1..5 (índice 0 = humor 1). */
export const moodColors = ['#CF6B53', '#DF9559', '#E1BA55', '#83AD66', '#3C8B5E'];
export const moodEmojis = ['😣', '🙁', '😐', '🙂', '😄'];
export const moodLabels = ['Muito mal', 'Mal', 'Neutro', 'Bem', 'Muito bem'];

/** Cores por nível de estresse. */
export const stressColors: Record<string, string> = {
  baixo: colors.success,
  moderado: colors.honey,
  alto: colors.clay,
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, huge: 44 };
export const radius = { xs: 10, sm: 14, md: 18, lg: 24, xl: 30, pill: 999 };

/** Tipografia — Fraunces para títulos/números, Plus Jakarta para UI. */
export const font: Record<string, TextStyle> = {
  display: { fontFamily: fonts.serifBlack, fontSize: 44, color: colors.ink, letterSpacing: -1 },
  h1: { fontFamily: fonts.serif, fontSize: 27, color: colors.ink, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.serif, fontSize: 21, color: colors.ink, letterSpacing: -0.2 },
  h3: { fontFamily: fonts.sansBold, fontSize: 16, color: colors.ink, letterSpacing: -0.1 },
  bodyLg: { fontFamily: fonts.sans, fontSize: 16, color: colors.ink, lineHeight: 24 },
  body: { fontFamily: fonts.sans, fontSize: 14.5, color: colors.ink, lineHeight: 22 },
  label: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.inkSoft },
  small: { fontFamily: fonts.sans, fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
  tiny: { fontFamily: fonts.sansMed, fontSize: 11.5, color: colors.inkFaint },
  overline: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
};

/** Sombras suaves de tom quente. */
export const shadow = {
  soft: {
    shadowColor: '#2A2114',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  card: {
    shadowColor: '#2A2114',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 5,
  },
  lift: {
    shadowColor: '#0F332A',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 9,
  },
};
