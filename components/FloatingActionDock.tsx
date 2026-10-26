import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/theme';

type FloatingActionDockProps = {
  onOpenTerminal: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen?: boolean;
};

export function FloatingActionDock({
  onOpenTerminal,
  onToggleCopilot,
  isCopilotOpen = false,
}: FloatingActionDockProps) {
  const t = useTheme();

  // If Copilot is currently expanded, hide the dock so it doesn't collide
  if (isCopilotOpen) return null;

  return (
    <View style={[styles.dockContainer, { borderColor: 'rgba(125, 185, 255, 0.24)' }]}>
      {/* CLI Terminal Action */}
      <Pressable
        onPress={onOpenTerminal}
        style={({ pressed }) => [
          styles.actionBtn,
          { opacity: pressed ? 0.75 : 1 },
        ]}>
        <Text style={styles.terminalIcon}>{'>_'}</Text>
        <Text style={[styles.actionLabel, { color: '#F1F5F9' }]}>Terminal</Text>
        <View style={styles.shortcutBadge}>
          <Text style={styles.shortcutText}>`</Text>
        </View>
      </Pressable>

      {/* Sleek Vertical Divider */}
      <View style={styles.divider} />

      {/* AI Copilot Action */}
      <Pressable
        onPress={onToggleCopilot}
        style={({ pressed }) => [
          styles.actionBtn,
          { opacity: pressed ? 0.75 : 1 },
        ]}>
        <Text style={{ fontSize: 14 }}>🤖</Text>
        <Text style={[styles.actionLabel, { color: t.accent }]}>Ask Mr.A.S.K</Text>
        <View style={styles.livePulseDot} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    zIndex: 99998,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 13, 20, 0.90)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
    // @ts-ignore
    backdropFilter: Platform.OS === 'web' ? 'blur(16px)' : undefined,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  terminalIcon: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  shortcutBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  shortcutText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
});
