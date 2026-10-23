import { SymbolView } from 'expo-symbols';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Dimensions, Image, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { AICopilot } from '@/components/AICopilot';
import { DeveloperTerminal } from '@/components/DeveloperTerminal';
import { RecruiterCVStudio } from '@/components/RecruiterCVStudio';
import { useThemeContext } from '@/constants/theme';
import { profile } from '@/data/profile';
import { openGmail, openLink } from '@/lib/links';

const navItems: any[] = [
  { label: 'Home', path: '/', icon: { ios: 'house', android: 'home', web: 'home' } },
  { label: 'About', path: '/about', icon: { ios: 'person', android: 'person', web: 'person' } },
  { label: 'Portfolio', path: '/projects', icon: { ios: 'folder', android: 'folder', web: 'folder' } },
  { label: 'Skills', path: '/skills', icon: { ios: 'star', android: 'star', web: 'star' } },
  { label: 'Services', path: '/services', icon: { ios: 'briefcase', android: 'work', web: 'briefcase' } },
  { label: 'Contact', path: '/contact', icon: { ios: 'envelope', android: 'mail', web: 'mail' } },
];

export default function TabLayout() {
  const { theme: t, isDark, toggleMode } = useThemeContext();
  const router = useRouter();
  const rawPath = usePathname();
  const pathname = rawPath.replace(/^\/\(tabs\)/, '') || '/';
  const isMobile = Dimensions.get('window').width < 900;

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isCVStudioOpen, setIsCVStudioOpen] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '`' || e.key === '~') {
          const target = e.target as HTMLElement;
          if (
            target &&
            (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
          ) {
            return;
          }
          e.preventDefault();
          setIsTerminalOpen((prev) => !prev);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  const isItemActive = (targetPath: string) => {
    if (targetPath === '/') {
      return pathname === '/';
    }
    if (targetPath === '/projects') {
      return pathname === '/projects' || pathname.startsWith('/project');
    }
    return pathname === targetPath || pathname.startsWith(targetPath + '/');
  };

  const renderNavButton = (item: any) => {
    const active = isItemActive(item.path);
    return (
      <Pressable
        key={item.label}
        onPress={() => router.push(item.path as never)}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: isMobile ? 10 : 12,
          paddingHorizontal: isMobile ? 10 : 12,
          borderRadius: 10,
          backgroundColor: active ? t.navActive : 'transparent',
        })}>
        <SymbolView
          name={item.icon}
          tintColor={active ? t.accent : t.muted}
          size={isMobile ? 16 : 18}
        />
        {!isMobile && (
          <Text
            style={{
              color: active ? t.accent : t.navText,
              fontSize: 16,
              fontWeight: active ? '700' : '500',
              marginLeft: 10,
            }}>
            {item.label}
          </Text>
        )}
      </Pressable>
    );
  };

  if (isMobile) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <View
          style={{
            backgroundColor: t.sidebar,
            paddingTop: 28,
            paddingHorizontal: 16,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: t.sidebarBorder,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Image
              source={require('@/assets/images/profile-photo.png')}
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: t.avatarBorder,
                backgroundColor: t.avatarBg,
              }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: t.text, fontSize: 20, fontWeight: '800' }}>{profile.displayName}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              <Pressable
                onPress={() => setIsTerminalOpen(true)}
                style={{
                  paddingHorizontal: 7,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#10b98122',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#10b981',
                }}>
                <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 11, fontFamily: 'monospace' }}>
                  {'>_' }
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsCVStudioOpen(true)}
                style={{
                  paddingHorizontal: 7,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#38bdf822',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#38bdf8',
                }}>
                <Text style={{ color: '#38bdf8', fontWeight: '800', fontSize: 10 }}>
                  CV
                </Text>
              </Pressable>
              {/* Theme toggle on mobile */}
              <Pressable
                onPress={toggleMode}
                accessibilityLabel="Toggle light/dark theme"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: t.iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: t.iconBorder,
                }}>
                <Text style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</Text>
              </Pressable>
              <Pressable
                onPress={() => openGmail()}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: t.iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: t.iconBorder,
                }}>
                <Text style={{ color: t.iconText, fontWeight: '800', fontSize: 13 }}>✉</Text>
              </Pressable>
              <Pressable
                onPress={() => openLink(profile.github)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: t.iconBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: t.iconBorder,
                }}>
                <Text style={{ color: t.iconText, fontWeight: '800', fontSize: 11 }}>GH</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 10 }}>
            {navItems.map((item) => renderNavButton(item))}
          </ScrollView>
        </View>

        <View style={{ flex: 1, backgroundColor: t.tabContentBg }}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: { display: 'none' },
              tabBarShowLabel: false,
              tabBarButton: () => null,
            }}
          >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
            <Tabs.Screen name="about" options={{ title: 'About' }} />
            <Tabs.Screen name="skills" options={{ title: 'Skills' }} />
            <Tabs.Screen name="services" options={{ title: 'Services' }} />
            <Tabs.Screen name="contact" options={{ title: 'Contact' }} />
          </Tabs>
        </View>
        <AICopilot />
        <DeveloperTerminal
          isOpen={isTerminalOpen}
          onClose={() => setIsTerminalOpen(false)}
          onOpenCVStudio={() => setIsCVStudioOpen(true)}
        />
        <RecruiterCVStudio
          isOpen={isCVStudioOpen}
          onClose={() => setIsCVStudioOpen(false)}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: t.bg }}>
      <View
        style={{
          width: 300,
          backgroundColor: t.sidebar,
          paddingTop: 36,
          paddingHorizontal: 18,
          paddingBottom: 18,
          borderRightWidth: 1,
          borderRightColor: t.sidebarBorder,
        }}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Image
            source={require('@/assets/images/profile-photo.png')}
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 1,
              borderColor: t.avatarBorder,
              backgroundColor: t.avatarBg,
            }}
          />
        </View>

        <Text style={{ color: t.text, fontSize: 24, fontWeight: '800', marginBottom: 16 }}>
          {profile.displayName}
        </Text>

        <View style={{ flexDirection: 'row', marginBottom: 22, gap: 8 }}>
          <Pressable
            onPress={() => openGmail()}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: t.iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: t.iconBorder,
            }}>
            <Text style={{ color: t.iconText, fontWeight: '800', fontSize: 13 }}>✉</Text>
          </Pressable>

          <Pressable
            onPress={() => openLink(profile.github)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: t.iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: t.iconBorder,
            }}>
            <Text style={{ color: t.iconText, fontWeight: '800', fontSize: 11 }}>GH</Text>
          </Pressable>

          <Pressable
            onPress={() => openLink(profile.linkedin)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: t.iconBg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: t.iconBorder,
            }}>
            <Text style={{ color: t.iconText, fontWeight: '800', fontSize: 11 }}>in</Text>
          </Pressable>
        </View>

        <View style={{ gap: 6 }}>{navItems.map((item) => renderNavButton(item))}</View>

        {/* Bottom area: Terminal + CV Studio + Theme Switcher + Copyright */}
        <View style={{ marginTop: 'auto', paddingTop: 18, gap: 8 }}>
          <Pressable
            onPress={() => setIsTerminalOpen(true)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: '#10b98115',
              borderWidth: 1,
              borderColor: '#10b98144',
              opacity: pressed ? 0.8 : 1,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 13, fontFamily: 'monospace' }}>
                {'>_' }
              </Text>
              <Text style={{ color: t.text, fontSize: 13, fontWeight: '700' }}>
                CLI Terminal
              </Text>
            </View>
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#10b98133' }}>
              <Text style={{ color: '#10b981', fontSize: 11, fontFamily: 'monospace', fontWeight: '700' }}>`</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => setIsCVStudioOpen(true)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: '#38bdf815',
              borderWidth: 1,
              borderColor: '#38bdf844',
              opacity: pressed ? 0.8 : 1,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14 }}>📋</Text>
              <Text style={{ color: t.text, fontSize: 13, fontWeight: '700' }}>
                Recruiter CV Studio
              </Text>
            </View>
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#38bdf833' }}>
              <Text style={{ color: '#38bdf8', fontSize: 10, fontWeight: '800' }}>ATS</Text>
            </View>
          </Pressable>

          <Pressable
            onPress={toggleMode}
            accessibilityLabel="Toggle light or dark theme"
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: t.iconBg,
              borderWidth: 1,
              borderColor: t.iconBorder,
              opacity: pressed ? 0.75 : 1,
              marginBottom: 8,
            })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 14 }}>{isDark ? '🌙' : '☀️'}</Text>
              <Text style={{ color: t.text, fontSize: 13, fontWeight: '700' }}>
                {isDark ? 'Dark Theme' : 'Light Theme'}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                backgroundColor: t.navActive,
              }}>
              <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700' }}>
                {isDark ? 'Switch ☀️' : 'Switch 🌙'}
              </Text>
            </View>
          </Pressable>

          <View style={{ borderTopWidth: 1, borderTopColor: t.sidebarBorder, paddingTop: 12 }}>
            <Text style={{ color: t.muted, fontSize: 12, fontWeight: '600' }}>© {profile.displayName}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, backgroundColor: t.tabContentBg }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            tabBarShowLabel: false,
            tabBarButton: () => null,
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Home' }} />
          <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
          <Tabs.Screen name="about" options={{ title: 'About' }} />
          <Tabs.Screen name="skills" options={{ title: 'Skills' }} />
          <Tabs.Screen name="services" options={{ title: 'Services' }} />
          <Tabs.Screen name="contact" options={{ title: 'Contact' }} />
        </Tabs>
      </View>

      {/* Floating CLI Terminal Toggle Button (Desktop/Web) */}
      {!isMobile && (
        <Pressable
          onPress={() => setIsTerminalOpen(true)}
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: 84,
            right: 24,
            zIndex: 99998,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: '#0a0d14',
            borderWidth: 1,
            borderColor: '#10b981',
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            opacity: pressed ? 0.85 : 1,
          })}>
          <Text style={{ color: '#10b981', fontWeight: '800', fontSize: 13, fontFamily: 'monospace' }}>
            {'>_' }
          </Text>
          <Text style={{ color: '#f8fafc', fontSize: 12, fontWeight: '700' }}>
            Terminal
          </Text>
          <View style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, backgroundColor: '#10b98133' }}>
            <Text style={{ color: '#10b981', fontSize: 10, fontFamily: 'monospace', fontWeight: '800' }}>`</Text>
          </View>
        </Pressable>
      )}

      <AICopilot />

      <DeveloperTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onOpenCVStudio={() => setIsCVStudioOpen(true)}
      />

      <RecruiterCVStudio
        isOpen={isCVStudioOpen}
        onClose={() => setIsCVStudioOpen(false)}
      />
    </View>
  );
}
