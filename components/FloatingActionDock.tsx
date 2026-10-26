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

  return (
    <View
      style={[
        styles.dockContainer,
        {
          borderColor: isCopilotOpen ? 'rgba(56, 189, 248, 0.6)' : 'rgba(56, 189, 248, 0.35)',
          backgroundColor: 'rgba(9, 13, 22, 0.95)',
        },
      ]}>
      {/* CLI Terminal Action */}
      <Pressable
        onPress={() => {
          onOpenTerminal();
        }}
        accessibilityLabel="Open Developer CLI Terminal"
        style={({ pressed }) => [
          styles.actionBtn,
          {
            opacity: pressed ? 0.75 : 1,
            // @ts-ignore
            cursor: Platform.OS === 'web' ? 'pointer' : undefined,
          },
        ]}>
        <Text style={styles.terminalIcon}>{'>_'}</Text>
        <Text style={[styles.actionLabel, { color: '#F8FAFC' }]}>Terminal</Text>
        <View style={styles.shortcutBadge}>
          <Text style={styles.shortcutText}>`</Text>
        </View>
      </Pressable>

      {/* Sleek Vertical Divider */}
      <View style={styles.divider} />

      {/* AI Copilot Action */}
      <Pressable
        onPress={() => {
          onToggleCopilot();
        }}
        accessibilityLabel="Toggle AI Co-Pilot Assistant"
        style={({ pressed }) => [
          styles.actionBtn,
          {
            opacity: pressed ? 0.75 : 1,
            backgroundColor: isCopilotOpen ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            // @ts-ignore
            cursor: Platform.OS === 'web' ? 'pointer' : undefined,
          },
        ]}>
        <Text style={{ fontSize: 15 }}>🤖</Text>
        <Text style={[styles.actionLabel, { color: isCopilotOpen ? '#38BDF8' : t.accent }]}>
          Ask Mr.A.S.K
        </Text>
        <View
          style={[
            styles.livePulseDot,
            { backgroundColor: isCopilotOpen ? '#38BDF8' : '#10B981' },
          ]}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
    bottom: 22,
    right: 22,
    zIndex: 999998,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 12,
    // @ts-ignore
    backdropFilter: Platform.OS === 'web' ? 'blur(16px)' : undefined,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  terminalIcon: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 14,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  shortcutBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  shortcutText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginHorizontal: 4,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
});
