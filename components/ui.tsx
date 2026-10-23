import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { profile } from '@/data/profile';
import { gradient, useTheme } from '@/constants/theme';

/** Page wrapper: themed background, soft glow shapes, centred content column. */
export function Screen({ children }: { children: ReactNode }) {
  const t = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View
        style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: t.glow,
          pointerEvents: 'none',
        }}
      />
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingHorizontal: 18,
          paddingTop: 24,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 1040 }}>
          {children}
          <View style={{ alignItems: 'center', paddingVertical: 22, marginTop: 8 }}>
            <Text style={{ color: t.muted, fontSize: 12, letterSpacing: 0.5, fontWeight: '700' }}>
              © {currentYear} {profile.displayName}. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

/** Fades and slides its children in when the screen opens. */
export function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={{
        opacity: v,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}>
      {children}
    </Animated.View>
  );
}

/** Types out each word, deletes it, then moves on to the next one. */
export function Typewriter({ words, style }: { words: string[]; style?: TextStyle }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    let delay = deleting ? 35 : 80;
    if (!deleting && n === word.length) delay = 1500;
    if (deleting && n === 0) delay = 300;
    const id = setTimeout(() => {
      if (!deleting && n === word.length) setDeleting(true);
      else if (deleting && n === 0) {
        setDeleting(false);
        setI((x) => (x + 1) % words.length);
      } else setN((x) => x + (deleting ? -1 : 1));
    }, delay);
    return () => clearTimeout(id);
  }, [n, deleting, i, words]);

  const word = words[i % words.length];
  return (
    <Text style={style}>
      {word.slice(0, n)}
      <Text style={{ opacity: 0.5 }}>|</Text>
    </Text>
  );
}

export function Heading({ children, sub }: { children: ReactNode; sub?: string }) {
  const t = useTheme();
  return (
    <View style={{ marginTop: 34, marginBottom: 16 }}>
      <Text style={{ color: t.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.7 }}>{children}</Text>
      <View
        style={{
          width: 52,
          height: 2,
          borderRadius: 999,
          marginTop: 10,
          backgroundColor: '#8AA9D8',
        }}
      />
      {sub ? <Text style={{ color: t.muted, fontSize: 15, marginTop: 10, lineHeight: 22 }}>{sub}</Text> : null}
    </View>
  );
}

export function Chip({ label, onPress }: { label: string; onPress?: () => void }) {
  const t = useTheme();
  const content = (
    <View
      style={{
        backgroundColor: t.chip,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: t.border,
      }}>
      <Text style={{ color: t.chipText, fontSize: 13, fontWeight: '700' }}>{label}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}>
      {content}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const t = useTheme();
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          borderRadius: 12,
          overflow: 'hidden',
          opacity: pressed ? 0.84 : 1,
        })}>
        <LinearGradient
          colors={t.primaryBtnBg as unknown as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 18,
            paddingVertical: 11,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: t.primaryBtnBorder,
          }}>
          <Text style={{ color: t.primaryBtnText, fontWeight: '800', fontSize: 14, letterSpacing: 0.1 }}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderColor: t.border,
        borderWidth: 1,
        backgroundColor: t.card,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Text style={{ color: t.text, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.card,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 18,
        paddingTop: accent ? 20 : 18,
        marginBottom: 16,
        overflow: 'hidden',
      }}>
      {accent ? (
        <LinearGradient
          colors={['#7DB9FF', '#1B2633']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }}
        />
      ) : null}
      {children}
    </View>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: 142,
        backgroundColor: t.card,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
        shadowColor: '#149DDD',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
      }}>
      <Text style={{ color: t.accent, fontSize: 28, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: t.muted, fontSize: 14, marginTop: 2, lineHeight: 18 }}>{label}</Text>
    </View>
  );
}
