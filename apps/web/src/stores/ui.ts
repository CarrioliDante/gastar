"use client";

import { create } from "zustand";

interface UIStore {
  paletteOpen: boolean;
  captureType: "expense" | "income" | null;
  captureBlockId: string | null;
  openPalette: () => void;
  closePalette: () => void;
  openCapture: (type?: "expense" | "income", blockId?: string | null) => void;
  closeCapture: () => void;
}

export const useUIStore = create<UIStore>(set => ({
  paletteOpen: false,
  captureType: null,
  captureBlockId: null,
  openPalette: () => set({ paletteOpen: true }),
  closePalette: () => set({ paletteOpen: false }),
  openCapture: (type = "expense", blockId = null) => set({ captureType: type, captureBlockId: blockId }),
  closeCapture: () => set({ captureType: null, captureBlockId: null }),
}));
