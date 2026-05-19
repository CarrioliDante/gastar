import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import type { Theme, FontFamily } from '../lib/theme';

export type CurrencyCode = 'ARS' | 'USD' | 'BRL' | 'EUR';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  ARS: 'AR$',
  USD: '$',
  BRL: 'R$',
  EUR: '€',
};

// Adapter: expo-secure-store → Zustand storage interface
const secureStorage = createJSONStorage(() => ({
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
}));

interface AppStore {
  theme: Theme;
  font: FontFamily;
  currency: CurrencyCode;
  animationsEnabled: boolean;
  captureOpen: boolean;
  captureType: 'expense' | 'income';
  lastCaptureType: 'expense' | 'income';
  setTheme: (theme: Theme) => void;
  setFont: (font: FontFamily) => void;
  setCurrency: (currency: CurrencyCode) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setLastCaptureType: (type: 'expense' | 'income') => void;
  openCapture: (type: 'expense' | 'income') => void;
  closeCapture: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'light',
      font: 'sans',
      currency: 'ARS',
      animationsEnabled: true,
      captureOpen: false,
      captureType: 'expense',
      lastCaptureType: 'expense',
      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
      setCurrency: (currency) => set({ currency }),
      setAnimationsEnabled: (v) => set({ animationsEnabled: v }),
      setLastCaptureType: (type) => set({ lastCaptureType: type }),
      openCapture: (type) => set({ captureOpen: true, captureType: type }),
      closeCapture: () => set({ captureOpen: false }),
    }),
    {
      name: 'gastar-app-prefs',
      storage: secureStorage,
      // Only persist display preferences, not ephemeral UI state
      partialize: (s) => ({ theme: s.theme, font: s.font, currency: s.currency, animationsEnabled: s.animationsEnabled }),
    },
  ),
);
