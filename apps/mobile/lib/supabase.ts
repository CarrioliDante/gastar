import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const CHUNK_SIZE    = 1800; // SecureStore iOS limit ~2048 bytes

// Chunked adapter so large JWTs don't hit the SecureStore size limit
const storage = {
  async getItem(key: string): Promise<string | null> {
    const single = await SecureStore.getItemAsync(key);
    if (single !== null) return single;
    const countStr = await SecureStore.getItemAsync(`${key}:n`);
    if (!countStr) return null;
    const n = parseInt(countStr, 10);
    const parts: string[] = [];
    for (let i = 0; i < n; i++) {
      const chunk = await SecureStore.getItemAsync(`${key}:${i}`);
      if (chunk === null) return null;
      parts.push(chunk);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    if (value.length <= CHUNK_SIZE) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    await SecureStore.deleteItemAsync(key).catch(() => null);
    const n = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}:n`, String(n));
    for (let i = 0; i < n; i++) {
      await SecureStore.setItemAsync(`${key}:${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
    }
  },

  async removeItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key).catch(() => null);
    const countStr = await SecureStore.getItemAsync(`${key}:n`);
    if (!countStr) return;
    const n = parseInt(countStr, 10);
    for (let i = 0; i < n; i++) {
      await SecureStore.deleteItemAsync(`${key}:${i}`).catch(() => null);
    }
    await SecureStore.deleteItemAsync(`${key}:n`).catch(() => null);
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
