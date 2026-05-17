import { create } from 'zustand';
import type { Theme, FontFamily } from '../lib/theme';

interface AppStore {
  theme: Theme;
  font: FontFamily;
  captureOpen: boolean;
  captureType: 'expense' | 'income';
  setTheme: (theme: Theme) => void;
  setFont: (font: FontFamily) => void;
  openCapture: (type: 'expense' | 'income') => void;
  closeCapture: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  theme: 'light',
  font: 'sans',
  captureOpen: false,
  captureType: 'expense',
  setTheme: (theme) => set({ theme }),
  setFont: (font) => set({ font }),
  openCapture: (type) => set({ captureOpen: true, captureType: type }),
  closeCapture: () => set({ captureOpen: false }),
}));
