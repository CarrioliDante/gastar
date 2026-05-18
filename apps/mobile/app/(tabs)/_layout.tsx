import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { CaptureSheet } from '../../components/CaptureSheet';
import { useAppStore } from '../../store/app';

export default function TabsLayout() {
  const { captureOpen, captureType, openCapture, closeCapture } = useAppStore();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        initialRouteName="home"
        tabBar={(props) => (
          <BottomNav
            state={props.state as any}
            navigation={props.navigation as any}
            onCapture={openCapture}
          />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="transactions" />
        <Tabs.Screen name="blocks" />
        <Tabs.Screen name="insights" />
      </Tabs>
      <CaptureSheet
        open={captureOpen}
        initialType={captureType}
        onClose={closeCapture}
      />
    </View>
  );
}
