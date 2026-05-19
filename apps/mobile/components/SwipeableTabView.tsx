import { type ReactNode, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
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
  const { width: screenWidth } = useWindowDimensions();
  const translateX = useSharedValue(0);

  const currentTab = segments[segments.length - 1] ?? 'home';
  const currentIndex = TAB_ORDER.indexOf(currentTab);

  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (direction === 'next' && currentIndex < TAB_ORDER.length - 1) {
        const path = TAB_PATHS[TAB_ORDER[currentIndex + 1]];
        if (path) {
          try { router.push(path as any); } catch {}
        }
      } else if (direction === 'prev' && currentIndex > 0) {
        const path = TAB_PATHS[TAB_ORDER[currentIndex - 1]];
        if (path) {
          try { router.push(path as any); } catch {}
        }
      }
    },
    [router, currentIndex],
  );

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    // Activate only on clear horizontal movement; yield to ScrollView on verticals.
    .activeOffsetX([-15, 15])
    .failOffsetY([-20, 20])
    .enabled(!disabled)
    .onUpdate((e) => {
      translateX.value = e.translationX * 0.3;
    })
    .onEnd((e) => {
      // Navigate only when the intent is unambiguous: sufficient distance OR velocity.
      const isSwipeLeft =
        e.translationX < -50 || (e.translationX < -20 && e.velocityX < -200);
      const isSwipeRight =
        e.translationX > 50 || (e.translationX > 20 && e.velocityX > 200);

      if (isSwipeLeft) {
        // Slide content out to the left, then navigate and reset position.
        translateX.value = withTiming(
          -screenWidth,
          { duration: 220, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(navigate)('next');
              translateX.value = 0;
            }
          },
        );
      } else if (isSwipeRight) {
        // Slide content out to the right, then navigate and reset position.
        translateX.value = withTiming(
          screenWidth,
          { duration: 220, easing: Easing.out(Easing.cubic) },
          (finished) => {
            if (finished) {
              runOnJS(navigate)('prev');
              translateX.value = 0;
            }
          },
        );
      } else {
        // Not enough distance/velocity — spring back.
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
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
