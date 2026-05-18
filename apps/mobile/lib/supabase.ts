import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://bdziettkcptrumojoxxq.supabase.co';
const SUPABASE_KEY  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_vtRpMq3AUoa121Wtaumseg_AUzwsTVh';
const CHUNK_SIZE    = 1800; // SecureStore iOS limit ~2048 bytes

// Chunked adapter so large JWTs don't hit the SecureStore size limit.
// Keys are sanitised because Supabase GoTrue may include characters (:/)
// that expo-secure-store rejects on iOS.
function sanitiseKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9._-]/g, '-');
}

const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const k = sanitiseKey(key);
      if (!k) return null;
      const single = await SecureStore.getItemAsync(k);
      if (single !== null) return single;
      const countStr = await SecureStore.getItemAsync(`${k}:n`);
      if (!countStr) return null;
      const n = parseInt(countStr, 10);
      const parts: string[] = [];
      for (let i = 0; i < n; i++) {
        const chunk = await SecureStore.getItemAsync(`${k}:${i}`);
        if (chunk === null) return null;
        parts.push(chunk);
      }
      return parts.join('');
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const k = sanitiseKey(key);
      if (!k) return;
      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(k, value);
        return;
      }
      await SecureStore.deleteItemAsync(k).catch(() => null);
      const n = Math.ceil(value.length / CHUNK_SIZE);
      await SecureStore.setItemAsync(`${k}:n`, String(n));
      for (let i = 0; i < n; i++) {
        await SecureStore.setItemAsync(`${k}:${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
      }
    } catch { /* noop */ }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const k = sanitiseKey(key);
      if (!k) return;
      await SecureStore.deleteItemAsync(k).catch(() => null);
      const countStr = await SecureStore.getItemAsync(`${k}:n`);
      if (!countStr) return;
      const n = parseInt(countStr, 10);
      for (let i = 0; i < n; i++) {
        await SecureStore.deleteItemAsync(`${k}:${i}`).catch(() => null);
      }
      await SecureStore.deleteItemAsync(`${k}:n`).catch(() => null);
    } catch { /* noop */ }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
