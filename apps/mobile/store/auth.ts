import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

interface AuthStore {
  session:    Session | null;
  user:       User | null;
  isChecking: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  session:    null,
  user:       null,
  isChecking: true,
  setSession: (session) => set({ session, user: session?.user ?? null, isChecking: false }),
}));
