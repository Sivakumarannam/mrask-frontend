import React, { useEffect, useRef } from 'react';
import { Animated, Platform, View, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

export function SkeletonBox({
  width = '100%',
  height = 18,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}) {
  const t = useTheme();
  const anim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(anim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: t.border,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

export function ProjectSkeletonCard() {
  const t = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.row}>
        <SkeletonBox width="55%" height={24} borderRadius={6} />
        <SkeletonBox width="20%" height={20} borderRadius={10} />
      </View>
      <SkeletonBox width="40%" height={16} borderRadius={6} style={{ marginTop: 10 }} />
      <SkeletonBox width="90%" height={14} borderRadius={4} style={{ marginTop: 14 }} />
      <SkeletonBox width="80%" height={14} borderRadius={4} style={{ marginTop: 6 }} />

      <View style={[styles.row, { marginTop: 16, gap: 8 }]}>
        <SkeletonBox width={70} height={26} borderRadius={13} />
        <SkeletonBox width={85} height={26} borderRadius={13} />
        <SkeletonBox width={65} height={26} borderRadius={13} />
      </View>

      <View style={[styles.row, { marginTop: 20, gap: 10 }]}>
        <SkeletonBox width={110} height={38} borderRadius={10} />
        <SkeletonBox width={85} height={38} borderRadius={10} />
      </View>
    </View>
  );
}

export function WeatherSkeletonCard() {
  const t = useTheme();

  return (
    <View style={{ gap: 12, paddingVertical: 10 }}>
      <SkeletonBox width="60%" height={22} borderRadius={6} />
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              minWidth: 80,
              padding: 12,
              borderRadius: 12,
              backgroundColor: t.cardAlt,
              borderColor: t.border,
              borderWidth: 1,
              alignItems: 'center',
              gap: 8,
            }}>
            <SkeletonBox width={40} height={14} borderRadius={4} />
            <SkeletonBox width={32} height={32} borderRadius={16} />
            <SkeletonBox width={45} height={18} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
