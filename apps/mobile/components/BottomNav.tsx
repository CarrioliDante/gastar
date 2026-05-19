import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Rect, Circle, Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/app';

type TabName = 'home' | 'transactions' | 'blocks' | 'insights';

const TABS_ORDER: TabName[] = ['home', 'transactions', 'blocks', 'insights'];

interface BottomNavProps {
  activeIndex: number;
  onNavigate: (name: TabName) => void;
  onCapture: (type: 'expense' | 'income') => void;
  scrollX: SharedValue<number>;
  screenWidth: number;
}

const TABS = [
  { name: 'home',         label: 'Inicio' },
  { name: 'transactions', label: 'Movim.' },
  { name: 'blocks',       label: 'Bloques' },
  { name: 'insights',     label: 'Lectura' },
];

function TabIcon({ name, active, color }: { name: string; active: boolean; color: string }) {
  const filled = active;
  switch (name) {
    case 'home':
      return (
        <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <Rect x={2.5} y={2.5} width={6.5} height={6.5} rx={1.4} fill={filled ? color : 'none'} stroke={color} strokeWidth={1.2} />
          <Rect x={11} y={2.5} width={6.5} height={6.5} rx={1.4} fill="none" stroke={color} strokeWidth={1.2} />
          <Rect x={2.5} y={11} width={6.5} height={6.5} rx={1.4} fill="none" stroke={color} strokeWidth={1.2} />
          <Rect x={11} y={11} width={6.5} height={6.5} rx={1.4} fill="none" stroke={color} strokeWidth={1.2} />
        </Svg>
      );
    case 'transactions':
      return (
        <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <Line x1={4} y1={6} x2={16} y2={6} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={4} y1={10} x2={16} y2={10} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={4} y1={14} x2={11} y2={14} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          {filled && <Circle cx={15} cy={14} r={1.3} fill={color} />}
        </Svg>
      );
    case 'blocks':
      return (
        <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <Circle cx={6} cy={6} r={3} fill={filled ? color : 'none'} stroke={color} strokeWidth={1.2} />
          <Rect x={11} y={3} width={6} height={6} rx={1.3} fill="none" stroke={color} strokeWidth={1.2} />
          <Path d="M3 17l3-5 3 5" fill="none" stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
          <Circle cx={14} cy={14} r={3} fill="none" stroke={color} strokeWidth={1.2} />
        </Svg>
      );
    case 'insights':
      return (
        <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <Rect x={3}  y={10} width={3} height={6} rx={0.8} fill={filled ? color : 'none'} stroke={color} strokeWidth={1.2} />
          <Rect x={8}  y={6}  width={3} height={10} rx={0.8} fill={filled ? color : 'none'} stroke={color} strokeWidth={1.2} />
          <Rect x={13} y={8}  width={3} height={8}  rx={0.8} fill={filled ? color : 'none'} stroke={color} strokeWidth={1.2} />
        </Svg>
      );
    default:
      return null;
  }
}

function AnimatedTabItem({
  tab,
  tabIndex,
  active,
  onPress,
  fontMono,
  inkColor,
  scrollX,
  screenWidth,
}: {
  tab: { name: string; label: string };
  tabIndex: number;
  active: boolean;
  onPress: () => void;
  fontMono: string;
  inkColor: string;
  scrollX: SharedValue<number>;
  screenWidth: number;
}) {
  const animStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value / screenWidth - tabIndex);
    const progress = interpolate(distance, [0, 1], [1, 0], Extrapolation.CLAMP);
    return {
      opacity: interpolate(progress, [0, 1], [0.4, 1]),
      transform: [{ scale: interpolate(progress, [0, 1], [0.82, 1]) }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1, alignItems: 'center', paddingVertical: 6,
        borderRadius: 18, opacity: pressed ? 0.7 : 1,
      })}
    >
      <Animated.View style={[{ alignItems: 'center', gap: 3 }, animStyle]}>
        <TabIcon name={tab.name} active={active} color={inkColor} />
        <Text style={{ fontFamily: fontMono, fontSize: 9, fontWeight: '500', color: inkColor, letterSpacing: 0.3 }}>
          {tab.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

// TAB_POSITIONS maps each tab index (0-3) to its fractional center within the
// nav bar row. The row has 4 equal flex-1 tabs split by the FAB zone.
// Left half holds tabs 0,1; right half holds tabs 2,3.
// The FAB takes ~62px (46px button + 2×8px margin) out of the full nav width.
// We approximate positions as fractions: tabs take 2 equal slots each side
// with the FAB gap in the middle.
// Computed at render time from the nav bar's measured width via onLayout.
// For the indicator we use a simplified linear mapping over the 4 slots.
// Slot widths: [tabSlot, tabSlot, fabSlot, tabSlot, tabSlot]
// We interpolate scrollX → indicator translateX directly.

export function BottomNav({ activeIndex, onNavigate, onCapture, scrollX, screenWidth }: BottomNavProps) {
  const { C, isDark, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const activeRoute = TABS_ORDER[activeIndex] ?? 'home';
  const lastCaptureType = useAppStore((s) => s.lastCaptureType);

  const before = TABS.slice(0, 2);
  const after = TABS.slice(2);

  // The nav bar has horizontal padding of 8px on each side.
  // Inside: [tab0 flex:1][tab1 flex:1][FAB ~62px][tab2 flex:1][tab3 flex:1]
  // Nav bar total width ≈ screenWidth - 24px (12px paddingHorizontal each side).
  // FAB zone width = 46 + 2*4 margin = 54px (marginHorizontal:4 on the wrapping View).
  // Each tab slot = (navWidth - 54) / 4.
  // Tab center offsets from nav bar left edge (after 8px paddingHorizontal):
  //   tab0: tabSlot * 0.5
  //   tab1: tabSlot * 1.5
  //   tab2: tabSlot * 2.5 + 54
  //   tab3: tabSlot * 3.5 + 54
  // Indicator is centered, width 20px, so translateX = centerOffset - 10.
  const navWidth = screenWidth - 24; // 12px paddingHorizontal × 2
  const fabZone = 54; // 46px button + 4px marginHorizontal × 2
  const tabSlot = (navWidth - fabZone) / 4;

  const tabCenters = [
    tabSlot * 0.5,
    tabSlot * 1.5,
    tabSlot * 2.5 + fabZone,
    tabSlot * 3.5 + fabZone,
  ];

  // indicatorStyle: translateX tracks scrollX continuously.
  // scrollX goes 0 → 3*screenWidth for tabs 0→3.
  // We interpolate across all 4 tab positions.
  const indicatorStyle = useAnimatedStyle(() => {
    const t = scrollX.value / screenWidth; // 0..3 (continuous)
    // Clamp to valid range
    const tClamped = Math.max(0, Math.min(3, t));
    // Linear interpolation between tab centers
    const lo = Math.floor(tClamped);
    const hi = Math.min(3, lo + 1);
    const frac = tClamped - lo;
    const x = tabCenters[lo] + (tabCenters[hi] - tabCenters[lo]) * frac - 10; // -10 = half of 20px indicator
    return { transform: [{ translateX: x }] };
  });

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingBottom: insets.bottom + 8,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? 'rgba(12,12,12,0.88)' : 'rgba(250,250,248,0.88)',
          borderRadius: 28,
          paddingVertical: 6,
          paddingHorizontal: 8,
          borderWidth: 1,
          borderColor: C.hairline,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.45 : 0.08,
          shadowRadius: 24,
          elevation: 10,
        }}
      >
        {/* First two tabs */}
        {before.map((tab, i) => (
          <AnimatedTabItem
            key={tab.name}
            tab={tab}
            tabIndex={i}
            active={activeRoute === tab.name}
            onPress={() => onNavigate(tab.name as TabName)}
            fontMono={fontMono}
            inkColor={C.ink}
            scrollX={scrollX}
            screenWidth={screenWidth}
          />
        ))}

        {/* Capture FAB — dynamic icon based on last capture type */}
        <View style={{ flexDirection: 'row', gap: 5, marginHorizontal: 4 }}>
          <Pressable
            onPress={() => onCapture(lastCaptureType)}
            style={({ pressed }) => {
              const fill = lastCaptureType === 'expense';
              return {
                width: 46, height: 46, borderRadius: 99,
                backgroundColor: fill ? C.ink : C.bg,
                alignItems: 'center', justifyContent: 'center',
                borderWidth: fill ? 0 : 1,
                borderColor: fill ? undefined : C.ink,
                opacity: pressed ? 0.75 : 1,
                ...(fill
                  ? { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }
                  : {}),
              };
            }}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Line x1={3} y1={8} x2={13} y2={8} stroke={lastCaptureType === 'expense' ? C.bg : C.ink} strokeWidth={1.8} strokeLinecap="round" />
              {lastCaptureType === 'income' && (
                <Line x1={8} y1={3} x2={8} y2={13} stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
              )}
            </Svg>
          </Pressable>
        </View>

        {/* Last two tabs */}
        {after.map((tab, i) => (
          <AnimatedTabItem
            key={tab.name}
            tab={tab}
            tabIndex={i + 2}
            active={activeRoute === tab.name}
            onPress={() => onNavigate(tab.name as TabName)}
            fontMono={fontMono}
            inkColor={C.ink}
            scrollX={scrollX}
            screenWidth={screenWidth}
          />
        ))}
      </View>

    </View>
  );
}
