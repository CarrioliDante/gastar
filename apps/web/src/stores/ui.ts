"use client";

import { create } from "zustand";

interface UIStore {
  paletteOpen: boolean;
  captureType: "expense" | "income" | null;
  openPalette: () => void;
  closePalette: () => void;
  openCapture: (type?: "expense" | "income") => void;
  closeCapture: () => void;
}

export const useUIStore = create<UIStore>(set => ({
  paletteOpen: false,
  captureType: null,
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  openCapture: (type = "expense") => set({ captureType: type }),
  closeCapture: () => set({ captureType: null }),
}));
