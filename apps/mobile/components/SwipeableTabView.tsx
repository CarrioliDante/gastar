import { type ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRouter, useSegments } from 'expo-router';

const TAB_ORDER = ['home', 'transactions', 'blocks', 'insights'];

const TAB_PATHS: Record<string, string> = {
  home: '/(tabs)/home',
  transactions: '/(tabs)/transactions',
  blocks: '/(tabs)/blocks',
  insights: '/(tabs)/insights',
};

export function SwipeableTabView({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const router = useRouter();
  const segments = useSegments();
  const translateX = useSharedValue(0);

  const currentTab = segments[segments.length - 1] ?? 'home';
  const currentIndex = TAB_ORDER.indexOf(currentTab);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-10, 10])
    .enabled(!disabled)
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.3;
    })
    .onEnd((e) => {
      translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      if (e.translationX < -50 && currentIndex < TAB_ORDER.length - 1) {
        const next = TAB_ORDER[currentIndex + 1];
        const path = TAB_PATHS[next];
        if (path) {
          try {
            router.push(path as any);
          } catch {}
        }
      } else if (e.translationX > 50 && currentIndex > 0) {
        const prev = TAB_ORDER[currentIndex - 1];
        const path = TAB_PATHS[prev];
        if (path) {
          try {
            router.push(path as any);
          } catch {}
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[{ flex: 1 }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
