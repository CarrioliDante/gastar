import { useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { BottomNav } from '../../components/BottomNav';
import { CaptureSheet } from '../../components/CaptureSheet';
import { Sidebar } from '../../components/Sidebar';
import { useAppStore } from '../../store/app';
import HomeScreen from './home';
import TransactionsScreen from './transactions';
import BlocksScreen from './blocks';
import InsightsScreen from './insights';

const TABS = ['home', 'transactions', 'blocks', 'insights'] as const;
export type TabName = typeof TABS[number];

const SCREENS = [HomeScreen, TransactionsScreen, BlocksScreen, InsightsScreen] as const;

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const { captureOpen, captureType, openCapture, closeCapture, setActiveTabIndex } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const syncIndex = (idx: number) => {
    setActiveIndex(idx);
    setActiveTabIndex(idx);
  };

  const navigateTo = (name: TabName) => {
    const idx = TABS.indexOf(name);
    if (idx < 0) return;
    scrollRef.current?.scrollTo({ x: idx * width, animated: true });
    syncIndex(idx);
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        scrollEnabled={!sidebarOpen}
        bounces={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          syncIndex(idx);
        }}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {SCREENS.map((Screen, i) => (
          <View key={i} style={{ width, flex: 1 }}>
            <Screen />
          </View>
        ))}
      </Animated.ScrollView>

      <BottomNav
        activeIndex={activeIndex}
        onNavigate={navigateTo}
        onCapture={openCapture}
        scrollX={scrollX}
        screenWidth={width}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        activeTabIndex={activeIndex}
        onNavigateTab={(name) => navigateTo(name as TabName)}
      />

      <CaptureSheet
        open={captureOpen}
        initialType={captureType}
        onClose={closeCapture}
      />
    </View>
  );
}
