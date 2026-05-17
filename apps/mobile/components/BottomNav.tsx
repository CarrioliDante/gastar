import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Line, Rect, Circle, Path } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';

interface NavState {
  index: number;
  routes: Array<{ key: string; name: string }>;
}

interface BottomNavProps {
  state: NavState;
  navigation: { navigate: (name: string) => void };
  onCapture: (type: 'expense' | 'income') => void;
}

const TABS = [
  { name: 'home',         label: 'Inicio' },
  { name: 'transactions', label: 'Movim.' },
  { name: 'blocks',       label: 'Bloques' },
  { name: 'insights',     label: 'Lectura' },
  { name: 'settings',     label: 'Ajustes' },
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
          <Circle cx={10} cy={10} r={7} fill="none" stroke={color} strokeWidth={1.2} />
          <Path d="M10 10 L10 4 A 6 6 0 0 1 15.2 13 Z" fill={filled ? color : 'none'} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width={18} height={18} viewBox="0 0 20 20" fill="none">
          <Line x1={3} y1={6} x2={17} y2={6} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={3} y1={14} x2={17} y2={14} stroke={color} strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx={7} cy={6} r={2} fill="transparent" stroke={color} strokeWidth={1.2} />
          <Circle cx={13} cy={14} r={2} fill="transparent" stroke={color} strokeWidth={1.2} />
        </Svg>
      );
    default:
      return null;
  }
}

export function BottomNav({ state, navigation, onCapture }: BottomNavProps) {
  const { C, isDark, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name ?? 'home';

  const before = TABS.slice(0, 2);
  const after = TABS.slice(2);

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
        {before.map((tab) => {
          const active = activeRoute === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={({ pressed }) => ({
                flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6,
                borderRadius: 18, opacity: pressed ? 0.7 : (active ? 1 : 0.45),
              })}
            >
              <TabIcon name={tab.name} active={active} color={C.ink} />
              <Text style={{ fontFamily: fontMono, fontSize: 9, fontWeight: '500', color: C.ink, letterSpacing: 0.3 }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}

        {/* Capture FABs */}
        <View style={{ flexDirection: 'row', gap: 5, marginHorizontal: 4 }}>
          <Pressable
            onPress={() => onCapture('expense')}
            style={({ pressed }) => ({
              width: 46, height: 46, borderRadius: 99,
              backgroundColor: C.ink,
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            })}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Line x1={3} y1={8} x2={13} y2={8} stroke={C.bg} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </Pressable>
          <Pressable
            onPress={() => onCapture('income')}
            style={({ pressed }) => ({
              width: 46, height: 46, borderRadius: 99,
              backgroundColor: C.bg,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: C.ink,
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Line x1={3} y1={8} x2={13} y2={8} stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
              <Line x1={8} y1={3} x2={8} y2={13} stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>

        {/* Last three tabs */}
        {after.map((tab) => {
          const active = activeRoute === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name)}
              style={({ pressed }) => ({
                flex: 1, alignItems: 'center', gap: 3, paddingVertical: 6,
                borderRadius: 18, opacity: pressed ? 0.7 : (active ? 1 : 0.45),
              })}
            >
              <TabIcon name={tab.name} active={active} color={C.ink} />
              <Text style={{ fontFamily: fontMono, fontSize: 9, fontWeight: '500', color: C.ink, letterSpacing: 0.3 }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
