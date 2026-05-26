import { Stack } from 'expo-router';
import type { ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, Pressable, Platform } from 'react-native';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '../store/app';
import { useAuthStore } from '../store/auth';
import { THEMES } from '../lib/theme';
import { supabase } from '../lib/supabase';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const isDev = __DEV__;
  return (
    <View style={{
      flex: 1, backgroundColor: '#FAFAF9',
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 32, paddingBottom: 48,
    }}>
      {/* Monogram */}
      <View style={{
        width: 44, height: 44, borderRadius: 10,
        backgroundColor: '#111', alignItems: 'center', justifyContent: 'center',
        marginBottom: 32,
      }}>
        <Text style={{ fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 16, color: '#FAFAF9', fontWeight: '600' }}>G</Text>
      </View>

      <Text style={{
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 9, color: '#999', letterSpacing: 1.6,
        textTransform: 'uppercase', marginBottom: 12,
      }}>
        Error inesperado
      </Text>

      <Text style={{
        fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
        fontSize: 15, fontWeight: '500', color: '#111',
        letterSpacing: -0.3, textAlign: 'center', marginBottom: 8,
      }}>
        Algo salió mal
      </Text>

      {isDev && (
        <Text style={{
          fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
          fontSize: 10, color: '#888', letterSpacing: 0.2,
          textAlign: 'center', marginBottom: 28, lineHeight: 16,
          maxWidth: 320,
        }}>
          {error.message}
        </Text>
      )}

      <Pressable
        onPress={retry}
        style={({ pressed }) => ({
          paddingHorizontal: 24, paddingVertical: 12,
          borderRadius: 10, backgroundColor: '#111',
          opacity: pressed ? 0.7 : 1, marginBottom: 12,
        })}
      >
        <Text style={{
          fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
          fontSize: 14, fontWeight: '500', color: '#FAFAF9',
        }}>
          Reintentar
        </Text>
      </Pressable>

      <Text style={{
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontSize: 9, color: '#ccc', letterSpacing: 1.2,
        textTransform: 'uppercase', marginTop: 8,
      }}>
        gast.ar · monocromo
      </Text>
    </View>
  );
}

const DAY_MS = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: DAY_MS,
      retry: (failureCount, error: unknown) => {
        if ((error as { status?: number })?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

const persister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'gastar-query-cache',
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister, maxAge: DAY_MS }}
        >
          <Inner />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Inner() {
  const { theme } = useAppStore();
  const { setSession } = useAuthStore();
  const C = THEMES[theme];

  useEffect(() => {
    // Eagerly populate auth store from storage so isChecking resolves before queries fire
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        {/* (tabs) has its own horizontal swipe — no stack gesture needed */}
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false, animation: 'none' }} />
        {/* (auth) manages its own Stack internally */}
        <Stack.Screen name="(auth)" options={{ gestureEnabled: false, animation: 'none' }} />
        {/* Splash / index screen */}
        <Stack.Screen name="index" options={{ gestureEnabled: false, animation: 'none' }} />
      </Stack>
    </View>
  );
}
