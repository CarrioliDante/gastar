import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useAppStore } from '../store/app';
import { THEMES } from '../lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Inner />
    </SafeAreaProvider>
  );
}

function Inner() {
  const { theme } = useAppStore();
  const C = THEMES[theme];
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Slot />
    </View>
  );
}
