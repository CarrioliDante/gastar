import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

const SIZE = 32;

export function LoadingLogo() {
  const { C } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.5 + scale.value * 0.08,
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[{
        width: SIZE, height: SIZE, borderRadius: SIZE / 2,
        backgroundColor: C.ink,
      }, style]} />
    </View>
  );
}
