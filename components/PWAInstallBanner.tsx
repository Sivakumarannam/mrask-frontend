import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/constants/theme';

export function PWAInstallBanner() {
  const t = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Check if already running in standalone PWA mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone
    ) {
      setIsStandalone(true);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback alert for browsers without beforeinstallprompt (e.g. Safari)
      alert(
        'To install Mr.A.S.K:\n• On Safari iOS: Tap Share (📤) and select "Add to Home Screen".\n• On Chrome/Desktop: Click the install icon in the URL bar.'
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone || isDismissed) return null;

  return (
    <View style={[styles.container, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.leftRow}>
        <View style={[styles.appBadge, { backgroundColor: t.navActive, borderColor: t.accent }]}>
          <Text style={{ fontSize: 16 }}>📲</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: t.text }]}>Install Mr.A.S.K as App</Text>
          <Text style={[styles.sub, { color: t.muted }]}>
            Fast offline access, native feel, zero app store download needed.
          </Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        <Pressable
          onPress={handleInstallClick}
          style={({ pressed }) => [
            styles.installBtn,
            { backgroundColor: t.accent, opacity: pressed ? 0.8 : 1 },
          ]}>
          <Text style={styles.installBtnText}>Install App</Text>
        </Pressable>

        <Pressable
          onPress={() => setIsDismissed(true)}
          style={({ pressed }) => [
            styles.dismissBtn,
            { borderColor: t.border, opacity: pressed ? 0.6 : 1 },
          ]}>
          <Text style={[styles.dismissText, { color: t.muted }]}>✕</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 240,
  },
  appBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
  },
  sub: {
    fontSize: 11,
    lineHeight: 15,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  installBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  installBtnText: {
    color: '#05070A',
    fontWeight: '800',
    fontSize: 12,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
