import {
  Pressable,
  Text,
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Line, Path, Rect, Circle } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { useUser } from '../lib/hooks';
import { useAuthStore } from '../store/auth';
import { supabase } from '../lib/supabase';

const PANEL_WIDTH = 280;

// ── Tiny SVG icons ────────────────────────────────────────────────

function NavIcon({ id, active }: { id: string; active: boolean }) {
  const { C } = useTheme();
  const c = active ? C.ink : C.faint;
  const w = 1.3;
  const s: Record<string, React.ReactElement> = {
    home: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Rect x={2.5} y={2.5} width={5.5} height={5.5} rx={1} fill={active ? c : 'none'} stroke={c} strokeWidth={w} />
        <Rect x={10} y={2.5} width={5.5} height={5.5} rx={1} fill="none" stroke={c} strokeWidth={w} />
        <Rect x={2.5} y={10} width={5.5} height={5.5} rx={1} fill="none" stroke={c} strokeWidth={w} />
        <Rect x={10} y={10} width={5.5} height={5.5} rx={1} fill="none" stroke={c} strokeWidth={w} />
      </Svg>
    ),
    transactions: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Line x1={3} y1={5.5} x2={15} y2={5.5} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Line x1={3} y1={9} x2={15} y2={9} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Line x1={3} y1={12.5} x2={11} y2={12.5} stroke={c} strokeWidth={w} strokeLinecap="round" />
      </Svg>
    ),
    blocks: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Circle cx={5.5} cy={5.5} r={2.7} stroke={c} strokeWidth={w} fill={active ? c : 'none'} />
        <Rect x={10} y={3} width={5} height={5} rx={1} stroke={c} strokeWidth={w} fill="none" />
        <Path d="M3 15l2.5-4.5L8 15" stroke={c} strokeWidth={w} fill="none" strokeLinejoin="round" />
        <Circle cx={12.5} cy={12.5} r={2.7} stroke={c} strokeWidth={w} fill="none" />
      </Svg>
    ),
    insights: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Path d="M3 13 L7 8 L10 11 L15 5" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={15} cy={5} r={1.5} fill={c} />
      </Svg>
    ),
    calendar: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Rect x={2.5} y={3.5} width={13} height={12} rx={1.5} stroke={c} strokeWidth={w} fill="none" />
        <Line x1={2.5} y1={7.5} x2={15.5} y2={7.5} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Line x1={6} y1={2} x2={6} y2={5} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Line x1={12} y1={2} x2={12} y2={5} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Rect x={5.5} y={10} width={2} height={2} rx={0.5} fill={c} />
        <Rect x={8.5} y={10} width={2} height={2} rx={0.5} fill={c} />
      </Svg>
    ),
    installments: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Rect x={3} y={6} width={2.5} height={6} rx={0.4} fill={c} />
        <Rect x={6.5} y={6} width={2.5} height={6} rx={0.4} fill={c} />
        <Rect x={10} y={6} width={2.5} height={6} rx={0.4} fill={c} />
        <Rect x={13.5} y={6} width={2.5} height={6} rx={0.4} fill={c} />
      </Svg>
    ),
    recurring: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Path d="M3 9 A 6 6 0 0 1 14 6" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" />
        <Path d="M14 4 L14 6 L12 6" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M15 9 A 6 6 0 0 1 4 12" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" />
        <Path d="M4 14 L4 12 L6 12" stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    ),
    goals: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Circle cx={9} cy={9} r={6.5} stroke={c} strokeWidth={w} fill="none" />
        <Circle cx={9} cy={9} r={3.2} stroke={c} strokeWidth={w} fill="none" />
        <Circle cx={9} cy={9} r={1} fill={c} />
      </Svg>
    ),
    settings: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Line x1={3} y1={5.5} x2={15} y2={5.5} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Line x1={3} y1={12.5} x2={15} y2={12.5} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Circle cx={7} cy={5.5} r={1.6} fill={c} stroke={c} strokeWidth={w} />
        <Circle cx={12} cy={12.5} r={1.6} fill={c} stroke={c} strokeWidth={w} />
      </Svg>
    ),
    dolar: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Rect x={2.5} y={3.5} width={9} height={11} rx={1.5} stroke={c} strokeWidth={w} fill="none" />
        <Line x1={7} y1={7} x2={7} y2={12} stroke={c} strokeWidth={1} strokeLinecap="round" />
        <Path d="M5.5 8.5 L7 7 L8.5 8.5" stroke={c} strokeWidth={0.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Line x1={14} y1={5} x2={14} y2={10.4} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Line x1={12.5} y1={8} x2={15.5} y2={8} stroke={c} strokeWidth={w} strokeLinecap="round" />
        <Circle cx={14} cy={13} r={2.2} stroke={c} strokeWidth={w} fill="none" />
      </Svg>
    ),
    logout: (
      <Svg width={16} height={16} viewBox="0 0 18 18" fill="none">
        <Path d="M11 9H3M6 6l-3 3 3 3" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1" stroke={c} strokeWidth={w} strokeLinecap="round" />
      </Svg>
    ),
  };
  return s[id] ?? null;
}

// ── Nav link definitions ──────────────────────────────────────────

interface NavLink {
  href: string;
  id: string;
  label: string;
}

const PRIMARY_LINKS: NavLink[] = [
  { href: '/(tabs)/home', id: 'home', label: 'Inicio' },
  { href: '/(tabs)/transactions', id: 'transactions', label: 'Movimientos' },
  { href: '/(tabs)/blocks', id: 'blocks', label: 'Bloques' },
  { href: '/(tabs)/insights', id: 'insights', label: 'Lectura' },
];

const SECONDARY_LINKS: NavLink[] = [
  { href: '/installments', id: 'installments', label: 'Cuotas' },
  { href: '/recurring', id: 'recurring', label: 'Recurrentes' },
  { href: '/goals', id: 'goals', label: 'Objetivos' },
  { href: '/calendar', id: 'calendar', label: 'Calendario' },
  { href: '/dolar', id: 'dolar', label: 'Dólar' },
];

const BOTTOM_LINKS: NavLink[] = [
  { href: '/settings', id: 'settings', label: 'Ajustes' },
];

// ── Sidebar component ─────────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  activeTabIndex?: number;
  onNavigateTab?: (name: string) => void;

}

export function Sidebar({ isOpen, onOpen, onClose, activeTabIndex = 0, onNavigateTab }: SidebarProps) {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { data: user } = useUser();
  const { setSession } = useAuthStore();

  // ── animation values ────────────────────────────────────────────

  const translateX = useSharedValue(isOpen ? 0 : -PANEL_WIDTH);
  const backdropOpacity = useSharedValue(isOpen ? 0.35 : 0);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Drive animation from isOpen prop (e.g. when opened via button, not gesture)
  useEffect(() => {
    if (isOpen) {
      translateX.value = withTiming(0, { duration: 220 });
      backdropOpacity.value = withTiming(0.35, { duration: 220 });
    } else {
      translateX.value = withTiming(-PANEL_WIDTH, { duration: 220 });
      backdropOpacity.value = withTiming(0, { duration: 220 });
    }
  }, [isOpen]);

  // ── edge gesture: swipe right from left edge to open ───────────

  const edgeGesture = Gesture.Pan()
    .activeOffsetX([-9999, 15])
    .onStart(() => {
      translateX.value = -PANEL_WIDTH;
    })
    .onUpdate((e) => {
      translateX.value = Math.max(-PANEL_WIDTH, Math.min(0, -PANEL_WIDTH + e.translationX));
      backdropOpacity.value = ((translateX.value + PANEL_WIDTH) / PANEL_WIDTH) * 0.35;
    })
    .onEnd((e) => {
      const shouldOpen = e.translationX > 140 || e.velocityX > 500;
      if (shouldOpen) {
        translateX.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(0.35, { duration: 200 });
        runOnJS(onOpen)();
      } else {
        translateX.value = withTiming(-PANEL_WIDTH, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
      }
    });

  // ── panel gesture: swipe left on panel to close ────────────────

  const panelGesture = Gesture.Pan()
    .activeOffsetX([-15, 9999])
    .enabled(isOpen)
    .onStart(() => {
      // noop — panel starts at translateX = 0
    })
    .onUpdate((e) => {
      translateX.value = Math.max(-PANEL_WIDTH, Math.min(0, e.translationX));
      backdropOpacity.value = ((translateX.value + PANEL_WIDTH) / PANEL_WIDTH) * 0.35;
    })
    .onEnd((e) => {
      const shouldClose = e.translationX < -140 || e.velocityX < -500;
      if (shouldClose) {
        translateX.value = withTiming(-PANEL_WIDTH, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(onClose)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(0.35, { duration: 200 });
      }
    });

  // ── helpers ─────────────────────────────────────────────────────

  const userName = user?.name ?? user?.email?.split('@')[0] ?? '';
  const initial = userName.charAt(0).toUpperCase();

  const TAB_IDS = ['home', 'transactions', 'blocks', 'insights'];

  const isActive = (href: string): boolean => {
    const target = href.split('/').pop() ?? '';
    if (href.startsWith('/(tabs)')) {
      return TAB_IDS[activeTabIndex] === target;
    }
    return (segments as string[]).includes(target);
  };

  const navigate = (href: string) => {
    translateX.value = withTiming(-PANEL_WIDTH, { duration: 200 });
    backdropOpacity.value = withTiming(0, { duration: 200 });
    onClose();
    if (href.startsWith('/(tabs)') && onNavigateTab) {
      const tabId = href.split('/').pop() ?? '';
      onNavigateTab(tabId);
    } else {
      router.navigate(href as any);
    }
  };

  const handleLogout = async () => {
    translateX.value = withTiming(-PANEL_WIDTH, { duration: 200 });
    backdropOpacity.value = withTiming(0, { duration: 200 });
    onClose();
    await supabase.auth.signOut();
    setSession(null);
    router.replace('/login');
  };

  // ── render helper ───────────────────────────────────────────────

  function NavLinkItem({ link }: { link: NavLink }) {
    const active = isActive(link.href);
    return (
      <Pressable
        onPress={() => navigate(link.href)}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 8,
          marginBottom: 1,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <NavIcon id={link.id} active={active} />
        <Text
          style={{
            fontFamily: fontBody,
            fontSize: 14,
            fontWeight: active ? '500' : '400',
            letterSpacing: -0.2,
            color: active ? C.ink : C.mute,
            flex: 1,
          }}
        >
          {link.label}
        </Text>
        {active && (
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: C.ink,
            }}
          />
        )}
      </Pressable>
    );
  }

  // ── render ──────────────────────────────────────────────────────

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Edge drag zone — tiny target on the left edge */}
      {!isOpen && (
        <GestureDetector gesture={edgeGesture}>
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 20,
              zIndex: 999,
            }}
          />
        </GestureDetector>
      )}

      {/* Sidebar opens via left-edge swipe gesture */}

      {/* Dimming backdrop */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.35)',
          },
          backdropStyle,
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <Pressable style={{ flex: 1 }} onPress={() => {
          translateX.value = withTiming(-PANEL_WIDTH, { duration: 200 });
          backdropOpacity.value = withTiming(0, { duration: 200 });
          onClose();
        }} />
      </Animated.View>

      {/* Sliding panel */}
      <GestureDetector gesture={panelGesture}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: PANEL_WIDTH,
            zIndex: 1001,
            backgroundColor: C.surface,
            borderRightWidth: 1,
            borderRightColor: C.hairline,
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 20,
          },
          panelStyle,
        ]}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: insets.top + 20,
            paddingBottom: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* User section */}
          <View style={{ paddingHorizontal: 16, marginBottom: 28 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 99,
                  backgroundColor: C.hairline,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: fontDisplay,
                    fontSize: 12,
                    fontWeight: '500',
                    color: C.ink,
                  }}
                >
                  {initial || '?'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fontBody,
                    fontSize: 13,
                    fontWeight: '500',
                    color: C.ink,
                    letterSpacing: -0.2,
                  }}
                  numberOfLines={1}
                >
                  {userName || 'Cargando...'}
                </Text>
                {user?.email && (
                  <Text
                    style={{
                      fontFamily: fontMono,
                      fontSize: 9,
                      color: C.faint,
                      letterSpacing: 0.6,
                      marginTop: 1,
                    }}
                    numberOfLines={1}
                  >
                    {user.email}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Primary nav group (tabs) */}
          <View style={{ paddingHorizontal: 8, marginBottom: 4 }}>
            {PRIMARY_LINKS.map((link) => (
              <NavLinkItem key={link.href} link={link} />
            ))}
          </View>

          {/* Divider */}
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: C.hairline,
              marginHorizontal: 16,
              marginVertical: 6,
            }}
          />

          {/* Secondary nav group (standalone routes) */}
          <View style={{ paddingHorizontal: 8, marginBottom: 4 }}>
            {SECONDARY_LINKS.map((link) => (
              <NavLinkItem key={link.href} link={link} />
            ))}
          </View>
        </ScrollView>

        {/* Bottom section (settings + logout) — always visible */}

        {/* Divider before footer */}
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: C.hairline,
            marginHorizontal: 16,
          }}
        />

        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 8,
            paddingBottom: insets.bottom + 8,
          }}
        >
          {BOTTOM_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Pressable
                key={link.href}
                onPress={() => navigate(link.href)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  borderRadius: 8,
                  marginBottom: 2,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <NavIcon id={link.id} active={active} />
                <Text
                  style={{
                    fontFamily: fontBody,
                    fontSize: 14,
                    fontWeight: active ? '500' : '400',
                    letterSpacing: -0.2,
                    color: active ? C.ink : C.mute,
                    flex: 1,
                  }}
                >
                  {link.label}
                </Text>
                {active && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: C.ink,
                    }}
                  />
                )}
              </Pressable>
            );
          })}

          {/* Logout */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 10,
              paddingHorizontal: 8,
              borderRadius: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <NavIcon id="logout" active={false} />
            <Text
              style={{
                fontFamily: fontBody,
                fontSize: 14,
                fontWeight: '400',
                letterSpacing: -0.2,
                color: C.faint,
                flex: 1,
              }}
            >
              Cerrar sesion
            </Text>
          </Pressable>
        </View>
      </Animated.View>
      </GestureDetector>
    </View>
  );
}
