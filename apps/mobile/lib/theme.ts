import { Platform } from 'react-native';

export type Theme = 'light' | 'dark';
export type FontFamily = 'sans' | 'serif' | 'mono';

export interface Colors {
  bg: string;
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkDeep: string;
  inverse: string;
  mute: string;
  faint: string;
  whisper: string;
  hairline: string;
  hairline2: string;
}

export const THEMES: Record<Theme, Colors> = {
  light: {
    bg: '#F5F5F2',
    surface: '#FAFAF8',
    surfaceAlt: '#EFEEE9',
    ink: '#111111',
    inkDeep: '#0A0A0A',
    inverse: '#FAFAF8',
    mute: 'rgba(0,0,0,0.50)',
    faint: 'rgba(0,0,0,0.32)',
    whisper: 'rgba(0,0,0,0.18)',
    hairline: 'rgba(0,0,0,0.07)',
    hairline2: 'rgba(0,0,0,0.12)',
  },
  dark: {
    bg: '#0A0A0A',
    surface: '#101010',
    surfaceAlt: '#161614',
    ink: '#F4F3EE',
    inkDeep: '#FFFFFF',
    inverse: '#0A0A0A',
    mute: 'rgba(244,243,238,0.55)',
    faint: 'rgba(244,243,238,0.35)',
    whisper: 'rgba(244,243,238,0.20)',
    hairline: 'rgba(244,243,238,0.08)',
    hairline2: 'rgba(244,243,238,0.14)',
  },
};

const MONO_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export const FONTS: Record<FontFamily, {
  body: string | undefined;
  display: string | undefined;
  mono: string;
}> = {
  sans:  { body: undefined,   display: undefined,   mono: MONO_FONT },
  serif: { body: 'Georgia',   display: 'Georgia',   mono: MONO_FONT },
  mono:  { body: MONO_FONT,   display: MONO_FONT,   mono: MONO_FONT },
};
