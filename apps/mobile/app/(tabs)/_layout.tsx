import { useState } from 'react';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { BottomNav } from '../../components/BottomNav';
import { CaptureSheet } from '../../components/CaptureSheet';
import { SwipeableTabView } from '../../components/SwipeableTabView';
import { Sidebar } from '../../components/Sidebar';
import { useAppStore } from '../../store/app';

export default function TabsLayout() {
  const { captureOpen, captureType, openCapture, closeCapture } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      <SwipeableTabView disabled={sidebarOpen}>
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
      </SwipeableTabView>

      <Sidebar
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      <CaptureSheet
        open={captureOpen}
        initialType={captureType}
        onClose={closeCapture}
      />
    </View>
  );
}
