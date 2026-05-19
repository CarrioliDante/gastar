"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  paletteOpen: boolean;
  captureType: "expense" | "income" | null;
  captureBlockId: string | null;
  animationsEnabled: boolean;
  openPalette: () => void;
  closePalette: () => void;
  openCapture: (type?: "expense" | "income", blockId?: string | null) => void;
  closeCapture: () => void;
  setAnimationsEnabled: (v: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      paletteOpen: false,
      captureType: null,
      captureBlockId: null,
      animationsEnabled: true,
      openPalette: () => set({ paletteOpen: true }),
      closePalette: () => set({ paletteOpen: false }),
      openCapture: (type = "expense", blockId = null) =>
        set({ captureType: type, captureBlockId: blockId }),
      closeCapture: () => set({ captureType: null, captureBlockId: null }),
      setAnimationsEnabled: (v) => set({ animationsEnabled: v }),
    }),
    {
      name: "gastar-ui-store",
      partialize: (state) => ({ animationsEnabled: state.animationsEnabled }),
    },
  ),
);
