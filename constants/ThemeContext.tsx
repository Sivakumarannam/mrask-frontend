import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

// ─── Palettes ──────────────────────────────────────────────────────────────
export const gradient = ['#149DDD', '#37B3ED', '#0EA5E9'] as const;

export type Theme = {
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accent2: string;
  accent3: string;
  chip: string;
  chipText: string;
  glow: string;
  glow2: string;
  sidebar: string;
  sidebarBorder: string;
  iconBg: string;
  iconBorder: string;
  iconText: string;
  navActive: string;
  navActiveText: string;
  navText: string;
  inputBg: string;
  inputBorder: string;
  tabContentBg: string;
  avatarBg: string;
  avatarBorder: string;
  primaryBtnBg: readonly [string, string];
  primaryBtnText: string;
  primaryBtnBorder: string;
};

const darkPalette: Theme = {
  bg: '#05070A',
  card: '#0D1116',
  cardAlt: '#121920',
  text: '#F5F7FA',
  muted: '#AAB7C4',
  border: '#1D2731',
  accent: '#7DB9FF',
  accent2: '#9CC9FF',
  accent3: '#D9E9FF',
  chip: '#101922',
  chipText: '#ECF5FF',
  glow: 'rgba(125, 185, 255, 0.08)',
  glow2: 'rgba(125, 185, 255, 0.05)',
  sidebar: '#050A0F',
  sidebarBorder: 'rgba(255,255,255,0.08)',
  iconBg: 'rgba(255,255,255,0.04)',
  iconBorder: 'rgba(255,255,255,0.1)',
  iconText: '#F1F5F9',
  navActive: 'rgba(125,185,255,0.10)',
  navActiveText: '#A9D2FF',
  navText: '#E4E9F0',
  inputBg: '#0C131A',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  tabContentBg: '#0B0F13',
  avatarBg: '#101922',
  avatarBorder: 'rgba(255, 255, 255, 0.14)',
  primaryBtnBg: ['#101922', '#1B2633'],
  primaryBtnText: '#D9E9FF',
  primaryBtnBorder: '#2B3A4B',
};

const lightPalette: Theme = {
  bg: '#F3F6FA',
  card: '#FFFFFF',
  cardAlt: '#F8FAFC',
  text: '#0F172A',
  muted: '#5A6A7E',
  border: '#DCE4EE',
  accent: '#1870C8',
  accent2: '#2563EB',
  accent3: '#1E3A8A',
  chip: '#E8F0FB',
  chipText: '#1859A3',
  glow: 'rgba(24, 112, 200, 0.08)',
  glow2: 'rgba(24, 112, 200, 0.04)',
  sidebar: '#FFFFFF',
  sidebarBorder: 'rgba(0, 0, 0, 0.08)',
  iconBg: 'rgba(0, 0, 0, 0.04)',
  iconBorder: 'rgba(0, 0, 0, 0.1)',
  iconText: '#1E293B',
  navActive: 'rgba(24, 112, 200, 0.10)',
  navActiveText: '#1870C8',
  navText: '#334155',
  inputBg: '#F8FAFC',
  inputBorder: '#CBD5E1',
  tabContentBg: '#F3F6FA',
  avatarBg: '#E2E8F0',
  avatarBorder: 'rgba(0, 0, 0, 0.10)',
  primaryBtnBg: ['#1D4ED8', '#2563EB'],
  primaryBtnText: '#FFFFFF',
  primaryBtnBorder: '#1D4ED8',
};

export type ThemeMode = 'dark' | 'light' | 'system';

// ─── Context ───────────────────────────────────────────────────────────────
type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkPalette,
  mode: 'dark',
  isDark: true,
  setMode: () => {},
  toggleMode: () => {},
});

// ─── Provider ──────────────────────────────────────────────────────────────
const STORAGE_KEY = 'portfolio_theme_mode';

function readStoredMode(): ThemeMode {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(STORAGE_KEY);
      if (val === 'light' || val === 'dark' || val === 'system') return val;
    }
  } catch {}
  return 'dark';
}

function writeStoredMode(mode: ThemeMode) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  // Default to dark on initial render to match static pre-rendered HTML
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readStoredMode();
    if (stored && stored !== 'dark') {
      setModeState(stored);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      writeStoredMode(mode);
    }
  }, [mode, mounted]);

  const effectiveDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const theme = effectiveDark ? darkPalette : lightPalette;

  const setMode = (m: ThemeMode) => setModeState(m);

  const toggleMode = () => {
    setModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, mode, isDark: effectiveDark, setMode, toggleMode }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hooks ─────────────────────────────────────────────────────────────────
export function useThemeContext() {
  return useContext(ThemeContext);
}

/** Drop-in replacement for the old useTheme() — returns just the palette */
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}
