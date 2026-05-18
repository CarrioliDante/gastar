import React, { useEffect, useRef } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue, withTiming, withDelay,
  useAnimatedStyle, runOnJS, Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useTheme } from '../hooks/useTheme';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

const { width: W, height: H } = Dimensions.get('window');
const CIRCLE = 72;
const DIAGONAL = Math.sqrt(W * W + H * H);

export default function PreBoot() {
  const { C, fontMono } = useTheme();
  const router = useRouter();
  const { setSession } = useAuthStore();

  const size    = useSharedValue(CIRCLE);
  const opacity = useSharedValue(0);
  const textOp  = useSharedValue(0);

  const exitCalled    = useRef(false);
  const sessionResult = useRef<boolean | null>(null);
  const animReady     = useRef(false);

  const circleStyle = useAnimatedStyle(() => ({
    width:  size.value,
    height: size.value,
    borderRadius: size.value / 2,
    opacity: opacity.value,
  }));
  const textStyle = useAnimatedStyle(() => ({ opacity: textOp.value }));

  const goHome  = () => router.replace('/(tabs)/home');
  const goLogin = () => router.replace('/login');

  const exit = (hasSession: boolean) => {
    if (exitCalled.current) return;
    exitCalled.current = true;

    textOp.value = withTiming(0, { duration: 180 });

    if (hasSession) {
      opacity.value = withTiming(0, { duration: 350 }, (done) => {
        'worklet';
        if (done) runOnJS(goHome)();
      });
    } else {
      // Expand the circle until it fills the entire screen
      size.value = withTiming(DIAGONAL, { duration: 800, easing: Easing.out(Easing.cubic) }, (done) => {
        'worklet';
        if (done) runOnJS(goLogin)();
      });
    }
  };

  const onAnimDone = () => {
    animReady.current = true;
    textOp.value = withTiming(1, { duration: 300 });
    if (sessionResult.current !== null) {
      setTimeout(() => exit(sessionResult.current!), 500);
    }
  };

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    size.value    = withTiming(CIRCLE, { duration: 500 }, () => {
      'worklet';
      runOnJS(onAnimDone)();
    });

    const minWait = new Promise<void>((r) => setTimeout(r, 1600));
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await minWait;
      if (session) setSession(session);
      sessionResult.current = session !== null;
      if (animReady.current) exit(session !== null);
    });
  }, []);

  return (
    <View style={{
      flex: 1, backgroundColor: C.bg,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Animated.View style={[{
        backgroundColor: C.ink,
        position: 'absolute',
      }, circleStyle]} />

      <Animated.View style={[{
        position: 'absolute', bottom: 52,
        left: 0, right: 0, alignItems: 'center',
      }, textStyle]}>
        <Text style={{
          fontFamily: fontMono, fontSize: 10, color: C.ink,
          letterSpacing: 2.4, textTransform: 'uppercase',
        }}>
          GAST · AR
        </Text>
      </Animated.View>
    </View>
  );
}
