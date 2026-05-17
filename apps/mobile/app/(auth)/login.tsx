import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown, FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/auth';

export default function LoginScreen() {
  const { C, fontBody, fontDisplay, fontMono } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setSession } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const passRef = useRef<TextInput>(null);

  const canSubmit = email.includes('@') && password.length >= 6;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

    if (err) {
      setError('Email o contraseña incorrectos');
      setLoading(false);
      return;
    }

    if (data.session) {
      setSession(data.session);
      const meta = data.session.user.user_metadata;
      if (!meta?.onboarding_completed) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/home');
      }
    }
  };

  const inputStyle = {
    fontFamily: fontDisplay,
    fontSize: 16,
    color: C.ink,
    letterSpacing: -0.3,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.hairline,
    marginBottom: 28,
  } as const;

  const labelStyle = {
    fontFamily: fontMono,
    fontSize: 9,
    color: C.faint,
    letterSpacing: 1.4,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 32,
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View
          entering={FadeInDown.duration(400).springify().damping(28)}
          style={{ marginBottom: 52 }}
        >
          <Svg width={40} height={40} viewBox="0 0 40 40" style={{ marginBottom: 24 }}>
            <SvgCircle cx={20} cy={20} r={20} fill={C.ink} />
            <SvgCircle cx={20} cy={20} r={6.4} fill={C.bg} />
          </Svg>
          <Text style={{
            fontFamily: fontDisplay, fontSize: 26, fontWeight: '500',
            letterSpacing: -1, color: C.ink, marginBottom: 6,
          }}>
            Bienvenido de vuelta
          </Text>
          <Text style={{
            fontFamily: fontBody, fontSize: 14, color: C.mute, lineHeight: 22,
          }}>
            Iniciá sesión para continuar
          </Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(80).duration(400).springify().damping(28)}>
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
            onSubmitEditing={() => passRef.current?.focus()}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(400).springify().damping(28)}>
          <Text style={labelStyle}>Contraseña</Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              ref={passRef}
              style={inputStyle}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={C.whisper}
              secureTextEntry={!showPass}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
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
        </Animated.View>

        {/* Error */}
        {error && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text style={{
              fontFamily: fontBody, fontSize: 12, color: C.ink,
              backgroundColor: C.surface, borderRadius: 8,
              paddingHorizontal: 14, paddingVertical: 10,
              marginBottom: 20, overflow: 'hidden',
            }}>
              {error}
            </Text>
          </Animated.View>
        )}

        {/* Submit */}
        <Animated.View entering={FadeInDown.delay(200).duration(400).springify().damping(28)}>
          <Pressable
            onPress={handleLogin}
            disabled={!canSubmit || loading}
            style={({ pressed }) => ({
              height: 52, borderRadius: 14,
              backgroundColor: canSubmit ? C.ink : C.surface,
              borderWidth: canSubmit ? 0 : 1,
              borderColor: C.hairline,
              alignItems: 'center', justifyContent: 'center',
              opacity: pressed ? 0.75 : 1,
              marginBottom: 20,
            })}
          >
            <Text style={{
              fontFamily: fontBody, fontSize: 15, fontWeight: '500',
              letterSpacing: -0.3,
              color: canSubmit ? C.bg : C.faint,
            }}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Text>
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(260).duration(400).springify().damping(28)}
          style={{ alignItems: 'center' }}
        >
          <Pressable onPress={() => router.push('/onboarding')}>
            <Text style={{
              fontFamily: fontBody, fontSize: 13, color: C.mute,
            }}>
              ¿Primera vez?{' '}
              <Text style={{ color: C.ink, fontWeight: '500' }}>Crear cuenta →</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
