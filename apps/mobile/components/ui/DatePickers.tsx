import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAY_HEADERS = ['D','L','M','M','J','V','S'];

// ── DayPicker (1-31) ──────────────────────────────────────────────

export function DayPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (day: number | null) => void;
}) {
  const { C, fontMono, fontDisplay } = useTheme();
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, paddingRight: 24 }}
      >
        {value !== null && (
          <Pressable
            onPress={() => onChange(null)}
            style={{
              width: 38, height: 38, borderRadius: 10,
              borderWidth: 1, borderColor: C.hairline,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: fontMono, fontSize: 11, color: C.faint }}>─</Text>
          </Pressable>
        )}
        {days.map(d => {
          const sel = value === d;
          return (
            <Pressable
              key={d}
              onPress={() => onChange(d)}
              style={{
                width: 38, height: 38, borderRadius: 10,
                backgroundColor: sel ? C.ink : 'transparent',
                borderWidth: sel ? 0 : 1,
                borderColor: C.hairline,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{
                fontFamily: sel ? fontDisplay : fontMono,
                fontSize: sel ? 16 : 12,
                fontWeight: sel ? '500' : '400',
                color: sel ? C.inverse : C.ink,
              }}>
                {d}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── MonthCalendar ─────────────────────────────────────────────────

interface MonthCalendarProps {
  value: string | null;        // YYYY-MM-DD
  onChange: (date: string | null) => void;
}

export function MonthCalendar({ value, onChange }: MonthCalendarProps) {
  const { C, fontMono, fontDisplay, fontBody } = useTheme();

  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const [viewYear, setViewYear] = React.useState(() => {
    if (value) return parseInt(value.slice(0, 4), 10);
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = React.useState(() => {
    if (value) return parseInt(value.slice(5, 7), 10) - 1;
    return new Date().getMonth();
  });

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells: { day: number; month: 'prev' | 'current' | 'next' }[] = [];

    // Previous month tail
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, month: 'prev' });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: 'current' });
    }

    // Next month head (fill to 42 cells, 6 rows)
    while (cells.length < 42) {
      cells.push({ day: cells.length - daysInMonth - (firstDay === 0 ? 7 : firstDay), month: 'next' });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear(y => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleSelect = (day: number, month: 'prev' | 'current' | 'next') => {
    let m = viewMonth;
    let y = viewYear;
    if (month === 'prev') {
      m = viewMonth === 0 ? 11 : viewMonth - 1;
      y = viewMonth === 0 ? viewYear - 1 : viewYear;
    } else if (month === 'next') {
      m = viewMonth === 11 ? 0 : viewMonth + 1;
      y = viewMonth === 11 ? viewYear + 1 : viewYear;
    }
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(dateStr);
  };

  const selectedParts = value ? { y: parseInt(value.slice(0, 4)), m: parseInt(value.slice(5, 7)) - 1, d: parseInt(value.slice(8, 10)) } : null;

  return (
    <View style={{ borderWidth: 1, borderColor: C.hairline, borderRadius: 12, padding: 12 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Pressable onPress={goPrev} style={{ padding: 6 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 13, color: C.ink }}>←</Text>
        </Pressable>
        <Text style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: '500', color: C.ink }}>
          {MONTHS[viewMonth]} {viewYear}
        </Text>
        <Pressable onPress={goNext} style={{ padding: 6 }}>
          <Text style={{ fontFamily: fontMono, fontSize: 13, color: C.ink }}>→</Text>
        </Pressable>
      </View>

      {/* Day headers */}
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {DAY_HEADERS.map((h, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
            <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.mute, letterSpacing: 0.5 }}>{h}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {Array.from({ length: 6 }).map((_, row) => (
        <View key={row} style={{ flexDirection: 'row' }}>
          {calendarDays.slice(row * 7, (row + 1) * 7).map((cell, col) => {
            const isToday = cell.month === 'current' &&
              `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}` === today;
            const isSelected = selectedParts !== null &&
              cell.month === 'current' &&
              cell.day === selectedParts.d &&
              viewMonth === selectedParts.m &&
              viewYear === selectedParts.y;
            const isOutside = cell.month !== 'current';

            return (
              <Pressable
                key={col}
                onPress={() => handleSelect(cell.day, cell.month)}
                style={{
                  flex: 1, alignItems: 'center', justifyContent: 'center',
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: isSelected ? C.ink : 'transparent',
                  borderWidth: isToday && !isSelected ? 1 : 0,
                  borderColor: C.hairline,
                }}
              >
                <Text style={{
                  fontFamily: isSelected ? fontDisplay : fontMono,
                  fontSize: 12,
                  fontWeight: isSelected ? '500' : '400',
                  color: isSelected ? C.inverse : isOutside ? C.faint : C.ink,
                  opacity: isOutside ? 0.4 : 1,
                }}>
                  {cell.day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      {/* Clear */}
      {value !== null && (
        <Pressable
          onPress={() => onChange(null)}
          style={{ marginTop: 8, alignItems: 'center', paddingVertical: 6 }}
        >
          <Text style={{ fontFamily: fontMono, fontSize: 10, color: C.faint, letterSpacing: 0.5 }}>Limpiar</Text>
        </Pressable>
      )}
    </View>
  );
}
