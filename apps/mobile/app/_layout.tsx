import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';
import { THEMES } from '../lib/theme';
import { supabase } from '../lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error: unknown) => {
        if ((error as { status?: number })?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Inner />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function Inner() {
  const { theme } = useAppStore();
  const { setSession } = useAuthStore();
  const C = THEMES[theme];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </View>
  );
}
