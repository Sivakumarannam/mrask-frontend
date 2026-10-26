import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/theme';

type AudioWaveformProps = {
  active: boolean;
  mode?: 'listening' | 'speaking' | 'idle';
  label?: string;
};

const BAR_COUNT = 14;

export function AudioWaveform({ active, mode = 'listening', label }: AudioWaveformProps) {
  const t = useTheme();

  // Array of animated values for each frequency bar
  const animatedValues = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.18))
  ).current;

  useEffect(() => {
    if (!active) {
      animatedValues.forEach((val) => {
        Animated.timing(val, {
          toValue: 0.18,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      });
      return;
    }

    // Dynamic wave animation loop
    const animations = animatedValues.map((val, index) => {
      // Create varied speeds and heights to look like live organic speech
      const duration = 280 + (index % 5) * 90;
      const peak = 0.55 + ((index * 3) % 5) * 0.11;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, {
            toValue: peak,
            duration,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(val, {
            toValue: 0.15 + (index % 3) * 0.08,
            duration: duration * 1.1,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
    });

    Animated.parallel(animations).start();

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [active, animatedValues]);

  if (!active && !label) return null;

  const isSpeaking = mode === 'speaking';
  const accentColor = isSpeaking ? '#38BDF8' : '#10B981';
  const glowColor = isSpeaking ? 'rgba(56, 189, 248, 0.25)' : 'rgba(16, 185, 129, 0.25)';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: t.cardAlt,
          borderColor: accentColor,
          shadowColor: accentColor,
        },
      ]}>
      {/* Top Header Label & Status Pulse */}
      <View style={styles.headerRow}>
        <View style={[styles.pulseDot, { backgroundColor: accentColor }]} />
        <Text style={[styles.labelText, { color: accentColor }]}>
          {label || (isSpeaking ? 'AI COPILOT SPEAKING...' : 'LISTENING TO YOUR VOICE...')}
        </Text>
      </View>

      {/* 14-Bar Spectrum Visualizer */}
      <View style={styles.barsContainer}>
        {animatedValues.map((animVal, i) => {
          // Compute gradient hue from cyan to emerald/violet
          const barColor = isSpeaking
            ? i < 4
              ? '#38BDF8'
              : i < 10
              ? '#818CF8'
              : '#C084FC'
            : i < 4
            ? '#34D399'
            : i < 10
            ? '#10B981'
            : '#059669';

          return (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  backgroundColor: barColor,
                  transform: [{ scaleY: animVal }],
                  shadowColor: barColor,
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={[styles.hintText, { color: t.muted }]}>
        {isSpeaking
          ? 'Tap 🔊 to stop speech audio anytime'
          : 'Speak clearly into your microphone...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 10,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    justifyContent: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  labelText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 36,
  },
  bar: {
    width: 4,
    height: 32,
    borderRadius: 99,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  hintText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
});
