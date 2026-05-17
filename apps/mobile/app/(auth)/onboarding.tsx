import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, withSpring, withTiming, useAnimatedStyle, FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle as SvgCircle, Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

const { width: W } = Dimensions.get('window');
const SPRING = { damping: 26, stiffness: 300 };

const COUNTRIES = [
  { id: 'AR', label: 'Argentina', flag: '🇦🇷' },
  { id: 'MX', label: 'México',    flag: '🇲🇽' },
  { id: 'BR', label: 'Brasil',    flag: '🇧🇷' },
  { id: 'CO', label: 'Colombia',  flag: '🇨🇴' },
  { id: 'CL', label: 'Chile',     flag: '🇨🇱' },
  { id: 'UY', label: 'Uruguay',   flag: '🇺🇾' },
  { id: 'ES', label: 'España',    flag: '🇪🇸' },
  { id: 'OT', label: 'Otro',      flag: '🌎' },
] as const;

const PROFESSIONS = [
  { id: 'employed',   label: 'Empleado / Relación de dependencia' },
  { id: 'freelance',  label: 'Freelance / Independiente' },
  { id: 'business',   label: 'Empresario / Negocio propio' },
  { id: 'student',    label: 'Estudiante' },
  { id: 'other',      label: 'Otro' },
] as const;

const CURRENCIES = [
  { id: 'ARS', label: 'ARS', symbol: '$'  },
  { id: 'USD', label: 'USD', symbol: 'US$' },
  { id: 'BRL', label: 'BRL', symbol: 'R$' },
  { id: 'EUR', label: 'EUR', symbol: '€'  },
] as const;

const GOALS = [
  { id: 'save',    label: 'Ahorrar más',        sub: 'Construir un fondo y cumplir metas' },
  { id: 'control', label: 'Controlar gastos',   sub: 'Saber en qué se va la plata' },
  { id: 'cuotas',  label: 'Manejar cuotas',     sub: 'Organizar cuotas y recurrentes' },
  { id: 'all',     label: 'Visión completa',    sub: 'Una foto total de mis finanzas' },
] as const;

const TOTAL_STEPS = 4;

function Chip({
  selected, onPress, children, style,
}: {
  selected: boolean; onPress: () => void;
  children: React.ReactNode; style?: object;
}) {
  const { C, fontBody } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: selected ? C.ink : C.surface,
        borderWidth: 1,
        borderColor: selected ? C.ink : C.hairline,
        opacity: pressed ? 0.75 : 1,
        ...style,
      })}
    >
      {children}
    </Pressable>
  );
}

function ProgressDots({ step }: { step: number }) {
  const { C } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View key={i} style={{
          width: i === step ? 18 : 6,
          height: 6, borderRadius: 99,
          backgroundColor: i <= step ? C.ink : C.hairline2,
        }} />
      ))}
    </View>
  );
}

export default function OnboardingScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setSession } = useAuthStore();

  const [step, setStep]             = useState(0);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [country, setCountry]       = useState<string>('AR');
  const [profession, setProfession] = useState('');
  const [currency, setCurrency]     = useState('ARS');
  const [goal, setGoal]             = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [done, setDone]             = useState(false);

  const translateX = useSharedValue(0);
  const slideStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  const passRef = useRef<TextInput>(null);

  const slideIn = (dir: 1 | -1) => {
    translateX.value = dir * W * 0.35;
    translateX.value = withSpring(0, SPRING);
  };

  const canAdvance = () => {
    switch (step) {
      case 0: return email.includes('@') && password.length >= 6 && name.trim().length >= 2;
      case 1: return !!profession;
      case 2: return !!goal;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (!canAdvance() || loading) return;

    if (step === 0) {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });

      if (err) {
        setError(err.message.includes('already') ? 'Ese email ya tiene cuenta' : err.message);
        setLoading(false);
        return;
      }

      if (data.session) setSession(data.session);
      setLoading(false);
    }

    if (step === TOTAL_STEPS - 1) {
      // Last step: save metadata and navigate
      setLoading(true);
      await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          country, profession, currency, goal,
          onboarding_completed: true,
        },
      });
      setDone(true);
      setTimeout(() => router.replace('/(tabs)/home'), 1600);
      return;
    }

    slideIn(1);
    setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step === 0) { router.back(); return; }
    slideIn(-1);
    setStep(s => s - 1);
  };

  const inputStyle = {
    fontFamily: fontDisplay, fontSize: 16, color: C.ink,
    letterSpacing: -0.3, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.hairline,
    marginBottom: 22,
  } as const;

  const labelStyle = {
    fontFamily: fontMono, fontSize: 9, color: C.faint,
    letterSpacing: 1.4, textTransform: 'uppercase' as const, marginBottom: 8,
  };

  if (done) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Animated.View entering={FadeIn.duration(400)} style={{ alignItems: 'center' }}>
          <View style={{
            width: 64, height: 64, borderRadius: 99,
            backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center',
            marginBottom: 28,
          }}>
            <Svg width={28} height={28} viewBox="0 0 28 28">
              <Path
                d="M6 14.5l6 6L22 8"
                stroke={C.bg} strokeWidth={2.2}
                fill="none" strokeLinecap="round" strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={{
            fontFamily: fontDisplay, fontSize: 28, fontWeight: '500',
            letterSpacing: -1, color: C.ink, marginBottom: 10,
          }}>
            Bienvenido/a, {name.trim().split(' ')[0]}
          </Text>
          <Text style={{ fontFamily: fontBody, fontSize: 14, color: C.mute }}>
            Todo listo
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 32,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top nav */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
          <Pressable onPress={handleBack} style={{ padding: 4 }}>
            <Text style={{ fontFamily: fontBody, fontSize: 13, color: C.faint }}>
              {step === 0 ? 'Cancelar' : '← Atrás'}
            </Text>
          </Pressable>
          <ProgressDots step={step} />
          <View style={{ width: 60 }} />
        </View>

        {/* Step content */}
        <Animated.View style={slideStyle}>

          {/* ── Step 0: Account ── */}
          {step === 0 && (
            <View>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>
                Crear cuenta
              </Text>
              <Text style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: '500', letterSpacing: -1, color: C.ink, marginBottom: 36 }}>
                ¿Cómo empezamos?
              </Text>

              <Text style={labelStyle}>Nombre</Text>
              <TextInput
                style={inputStyle}
                value={name}
                onChangeText={setName}
                placeholder="Tu nombre"
                placeholderTextColor={C.whisper}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
              />

              <Text style={labelStyle}>Email</Text>
              <TextInput
                style={inputStyle}
                value={email}
                onChangeText={setEmail}
                placeholder="vos@ejemplo.com"
                placeholderTextColor={C.whisper}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />

              <Text style={labelStyle}>Contraseña</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  ref={passRef}
                  style={inputStyle}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={C.whisper}
                  secureTextEntry={!showPass}
                  returnKeyType="go"
                  onSubmitEditing={handleNext}
                />
                <Pressable
                  onPress={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 0, top: 14, padding: 4 }}
                >
                  <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 0.8 }}>
                    {showPass ? 'OCULTAR' : 'VER'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* ── Step 1: Context ── */}
          {step === 1 && (
            <View>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>
                1 / 2 · Contexto
              </Text>
              <Text style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: '500', letterSpacing: -1, color: C.ink, marginBottom: 32 }}>
                ¿Desde dónde nos{'\n'}encontramos?
              </Text>

              <Text style={{ ...labelStyle, marginBottom: 12 }}>País</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {COUNTRIES.map(c => (
                  <Chip key={c.id} selected={country === c.id} onPress={() => setCountry(c.id)}>
                    <Text style={{ fontFamily: fontBody, fontSize: 13, color: country === c.id ? C.bg : C.ink }}>
                      {c.flag} {c.label}
                    </Text>
                  </Chip>
                ))}
              </View>

              <Text style={{ ...labelStyle, marginBottom: 12 }}>Situación laboral</Text>
              <View style={{ gap: 8, marginBottom: 28 }}>
                {PROFESSIONS.map(p => (
                  <Chip key={p.id} selected={profession === p.id} onPress={() => setProfession(p.id)}>
                    <Text style={{ fontFamily: fontBody, fontSize: 13, color: profession === p.id ? C.bg : C.ink }}>
                      {p.label}
                    </Text>
                  </Chip>
                ))}
              </View>

              <Text style={{ ...labelStyle, marginBottom: 12 }}>Moneda principal</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CURRENCIES.map(c => (
                  <Chip key={c.id} selected={currency === c.id} onPress={() => setCurrency(c.id)}>
                    <Text style={{ fontFamily: fontMono, fontSize: 12, color: currency === c.id ? C.bg : C.ink }}>
                      {c.symbol} {c.id}
                    </Text>
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* ── Step 2: Goal ── */}
          {step === 2 && (
            <View>
              <Text style={{ fontFamily: fontMono, fontSize: 9, color: C.faint, letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 12 }}>
                2 / 2 · Objetivo
              </Text>
              <Text style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: '500', letterSpacing: -1, color: C.ink, marginBottom: 10 }}>
                ¿Para qué usás{'\n'}Gastar?
              </Text>
              <Text style={{ fontFamily: fontBody, fontSize: 13, color: C.mute, marginBottom: 32 }}>
                Esto ayuda a mostrarte lo más relevante.
              </Text>
              <View style={{ gap: 10 }}>
                {GOALS.map(g => (
                  <Pressable
                    key={g.id}
                    onPress={() => setGoal(g.id)}
                    style={({ pressed }) => ({
                      padding: 18, borderRadius: 12,
                      backgroundColor: goal === g.id ? C.ink : C.surface,
                      borderWidth: 1,
                      borderColor: goal === g.id ? C.ink : C.hairline,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <Text style={{
                      fontFamily: fontBody, fontSize: 14, fontWeight: '500',
                      letterSpacing: -0.3, color: goal === g.id ? C.bg : C.ink,
                      marginBottom: 4,
                    }}>
                      {g.label}
                    </Text>
                    <Text style={{
                      fontFamily: fontBody, fontSize: 12,
                      color: goal === g.id ? 'rgba(255,255,255,0.5)' : C.mute,
                    }}>
                      {g.sub}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* ── Step 3: Welcome ── */}
          {step === 3 && (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <View style={{
                width: 80, height: 80, borderRadius: 99,
                backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center',
                marginBottom: 32,
              }}>
                <Svg width={32} height={32} viewBox="0 0 32 32">
                  <Path
                    d="M7 16.5l7 7L25 9"
                    stroke={C.bg} strokeWidth={2.2}
                    fill="none" strokeLinecap="round" strokeLinejoin="round"
                  />
                </Svg>
              </View>
              <Text style={{
                fontFamily: fontDisplay, fontSize: 30, fontWeight: '500',
                letterSpacing: -1.2, color: C.ink, marginBottom: 10, textAlign: 'center',
              }}>
                Hola, {name.trim().split(' ')[0]}.
              </Text>
              <Text style={{
                fontFamily: fontBody, fontSize: 14, color: C.mute,
                lineHeight: 22, textAlign: 'center', maxWidth: 260,
              }}>
                Todo listo. Tu sistema de finanzas personales está configurado.
              </Text>
            </View>
          )}

        </Animated.View>

        {/* Error */}
        {error && (
          <Animated.View entering={FadeIn.duration(200)} style={{ marginTop: 8 }}>
            <Text style={{
              fontFamily: fontBody, fontSize: 12, color: C.ink,
              backgroundColor: C.surface, borderRadius: 8,
              paddingHorizontal: 14, paddingVertical: 10, overflow: 'hidden',
            }}>
              {error}
            </Text>
          </Animated.View>
        )}

        <View style={{ flex: 1, minHeight: 32 }} />

        {/* CTA button */}
        <View style={{ marginTop: 24 }}>
          <Pressable
            onPress={handleNext}
            disabled={!canAdvance() || loading}
            style={({ pressed }) => ({
              height: 52, borderRadius: 14,
              backgroundColor: canAdvance() ? C.ink : C.surface,
              borderWidth: canAdvance() ? 0 : 1,
              borderColor: C.hairline,
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
            })}
          >
            <Text style={{
              fontFamily: fontBody, fontSize: 15, fontWeight: '500',
              letterSpacing: -0.3,
              color: canAdvance() ? C.bg : C.faint,
            }}>
              {loading ? 'Un momento…' : step === TOTAL_STEPS - 1 ? 'Empezar →' : 'Continuar →'}
            </Text>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
