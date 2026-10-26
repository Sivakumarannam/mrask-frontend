import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeContext } from '@/constants/theme';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import { getWeather } from '@/lib/api';

type HistoryEntry = {
  id: string;
  command: string;
  output: string | React.ReactNode;
  type?: 'standard' | 'error' | 'success' | 'system';
};

const BANNER = `
  __  __         _      ____  _  __
 |  \\/  |_ _    /_\\    / ___|| |/ /
 | |\\/| | '_|  //_\\\\   \\___ \\| ' / 
 | |  | | |   /  _  \\   ___) | . \\ 
 |_|  |_|_|  /_/   \\_\\ |____/|_|\\_\\
  Terminal OS v2.5.0 — Type 'help' for commands.
  [Shortcut: press \` (backtick) anytime to toggle]
`;

export function DeveloperTerminal({
  isOpen,
  onClose,
  onOpenCVStudio,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenCVStudio?: () => void;
}) {
  const { theme: t, isDark, toggleMode } = useThemeContext();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 'init-banner',
      command: 'sys.init',
      output: BANNER,
      type: 'system',
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isProcessing, setIsProcessing] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOpen]);

  const handleCommand = async (rawCmd: string) => {
    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    setCmdHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setInput('');

    const entryId = 'cmd-' + Date.now();
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let response: React.ReactNode = '';
    let responseType: HistoryEntry['type'] = 'standard';

    switch (cmd) {
      case 'help':
        response = `AVAILABLE COMMANDS:
  help               - Show this manual
  skills             - View engineering skills by domain
  projects           - List production projects & tech stacks
  open <rag|weather> - Navigate directly to project demo
  weather <city>     - Live weather fetch via microservice
  ask <query>        - Query Siva's AI Engine
  cv / resume        - Launch ATS Recruiter CV Studio
  contact            - View email, GitHub, LinkedIn
  whoami             - View your session privileges
  theme              - Toggle Dark / Light theme
  clear              - Wipe terminal screen
  exit               - Close developer terminal`;
        break;

      case 'skills':
        response = `[CORE SKILLS MATRIX]
┌──────────────────┬─────────────────────────────────────────────────────────┐
│ DOMAIN           │ TECHNOLOGIES & TOOLS                                    │
├──────────────────┼─────────────────────────────────────────────────────────┤
│ Backend          │ Python, Django, DRF, FastAPI, Celery, REST APIs         │
│ Frontend & Mobile│ React Native, Expo, TypeScript, Next.js, HTML5/CSS3     │
│ AI & Vector Eng  │ Ollama, FAISS, Sentence-Transformers, PyPDF, RAG Pipeline│
│ Database         │ PostgreSQL, SQLite, Redis, dj-database-url              │
│ Cloud & DevOps   │ Docker, Gunicorn, Vercel, Render, Railway, Git/GitHub   │
└──────────────────┴─────────────────────────────────────────────────────────┘`;
        break;

      case 'projects':
        response = projects
          .map(
            (p, idx) =>
              `[${idx + 1}] ${p.title} (${p.role})\n    • Tagline: ${p.tagline}\n    • Stack: ${p.stack.join(', ')}\n    • Link: /project/${p.id}`
          )
          .join('\n\n') + `\n\n💡 Tip: Type 'open rag-chatbot' or 'open weather-app' to launch.`;
        break;

      case 'open':
        if (!args) {
          response = `Usage: open <project-slug>\nExamples:\n  open rag-chatbot\n  open weather-app`;
          responseType = 'error';
        } else {
          const target = projects.find((p) => p.id.toLowerCase() === args.toLowerCase());
          if (target) {
            response = `🚀 Launching ${target.title}...`;
            responseType = 'success';
            setTimeout(() => {
              onClose();
              router.push(`/project/${target.id}` as never);
            }, 600);
          } else {
            response = `Unknown project '${args}'. Type 'projects' to view valid slugs.`;
            responseType = 'error';
          }
        }
        break;

      case 'weather':
        if (!args) {
          response = `Usage: weather <city>\nExample: weather London  |  weather Tokyo  |  weather Guntur`;
          responseType = 'error';
        } else {
          setIsProcessing(true);
          try {
            const data = await getWeather(args);
            response = `┌─ WEATHER REPORT: ${data.city}, ${data.country} ───────────────────┐
│ Temperature : ${data.temperature}°C (Feels like: ${data.feels_like}°C)
│ Condition   : ${data.icon} ${data.description}
│ Humidity    : ${data.humidity}%
│ Wind Speed  : ${data.wind_speed} km/h
└──────────────────────────────────────────────────────────────┘`;
            responseType = 'success';
          } catch (err: any) {
            response = `Failed to fetch weather for '${args}': ${err?.message || 'City not found'}`;
            responseType = 'error';
          } finally {
            setIsProcessing(false);
          }
        }
        break;

      case 'ask':
        if (!args) {
          response = `Usage: ask <your question>\nExample: ask What is Siva's background?`;
          responseType = 'error';
        } else {
          response = `🤖 [Mr.A.S.K Engine Response]:\nSiva Kumar Annam is a Full-Stack Developer & AI Systems Engineer with proven expertise in building end-to-end Python/Django services, modern React Native/Expo client applications, and self-hosted RAG LLM workflows. He is currently open to full-time engineering opportunities.`;
          responseType = 'success';
        }
        break;

      case 'cv':
      case 'resume':
        response = `📄 Launching Recruiter CV Studio & ATS PDF Generator...`;
        responseType = 'success';
        if (onOpenCVStudio) {
          setTimeout(() => {
            onClose();
            onOpenCVStudio();
          }, 400);
        }
        break;

      case 'contact':
        response = `📫 SIVA'S CONTACT CO-ORDINATES:
  • Email   : ${profile.email}
  • GitHub  : ${profile.github}
  • Location: ${profile.location}
  • Status  : ${profile.openTo}`;
        break;

      case 'whoami':
        response = `User: guest_developer
Host: mrask-terminal-v2
Permissions: [EXECUTE, INSPECT, READ_ONLY]
Session ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        break;

      case 'theme':
        toggleMode();
        response = `Switched theme mode. Current: ${isDark ? 'Light Mode' : 'Dark Mode'}.`;
        responseType = 'success';
        break;

      case 'clear':
        setHistory([]);
        return;

      case 'exit':
      case 'quit':
        onClose();
        return;

      default:
        response = `Command not recognized: '${cmd}'. Type 'help' to see valid commands.`;
        responseType = 'error';
    }

    setHistory((prev) => [
      ...prev,
      {
        id: entryId,
        command: trimmed,
        output: response,
        type: responseType,
      },
    ]);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const handleKeyDown = (e: any) => {
    if (Platform.OS === 'web') {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (cmdHistory.length > 0) {
          const nextIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
          setHistoryIndex(nextIndex);
          setInput(cmdHistory[nextIndex]);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex !== -1) {
          const nextIndex = historyIndex + 1;
          if (nextIndex < cmdHistory.length) {
            setHistoryIndex(nextIndex);
            setInput(cmdHistory[nextIndex]);
          } else {
            setHistoryIndex(-1);
            setInput('');
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <View
      style={{
        position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        zIndex: 9999999,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? 8 : 24,
      }}>
      <View
        style={{
          width: isMobile ? '100%' : '88%',
          maxWidth: 960,
          height: isMobile ? '92%' : '80%',
          maxHeight: 700,
          backgroundColor: '#0a0d14',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#1e293b',
          shadowColor: '#00e5ff',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* Terminal Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: '#111827',
            borderBottomWidth: 1,
            borderBottomColor: '#1f2937',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pressable
              onPress={onClose}
              style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444' }}
            />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#f59e0b' }} />
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981' }} />
            <Text
              style={{
                color: '#94a3b8',
                fontSize: 12,
                fontWeight: '700',
                fontFamily: Platform.OS === 'web' ? 'monospace' : 'SpaceMono',
                marginLeft: 12,
              }}>
              siva@mrask-os: ~/portfolio (bash)
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            {onOpenCVStudio && (
              <Pressable
                onPress={() => {
                  onClose();
                  onOpenCVStudio();
                }}
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  backgroundColor: '#1e293b',
                }}>
                <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '700' }}>📄 CV Studio</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onClose}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                backgroundColor: '#374151',
              }}>
              <Text style={{ color: '#e5e7eb', fontSize: 11, fontWeight: '700' }}>ESC ✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Terminal Screen Area */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, padding: 16 }}
          contentContainerStyle={{ paddingBottom: 24 }}>
          {history.map((h) => (
            <View key={h.id} style={{ marginBottom: 12 }}>
              {h.type !== 'system' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Text style={{ color: '#10b981', fontWeight: '700', fontFamily: 'monospace' }}>
                    siva@mrask:~$
                  </Text>
                  <Text style={{ color: '#f8fafc', fontWeight: '600', fontFamily: 'monospace' }}>
                    {h.command}
                  </Text>
                </View>
              )}
              {typeof h.output === 'string' ? (
                <Text
                  style={{
                    color:
                      h.type === 'error'
                        ? '#f87171'
                        : h.type === 'success'
                        ? '#38bdf8'
                        : h.type === 'system'
                        ? '#a855f7'
                        : '#cbd5e1',
                    fontSize: 13,
                    lineHeight: 20,
                    fontFamily: Platform.OS === 'web' ? 'monospace' : 'SpaceMono',
                  }}>
                  {h.output}
                </Text>
              ) : (
                h.output
              )}
            </View>
          ))}

          {isProcessing && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <Text style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: 13 }}>
                [executing...]
              </Text>
            </View>
          )}

          {/* Interactive Command Input Line */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Text
              style={{
                color: '#10b981',
                fontWeight: '700',
                fontFamily: Platform.OS === 'web' ? 'monospace' : 'SpaceMono',
                fontSize: 14,
                marginRight: 6,
              }}>
              siva@mrask:~$
            </Text>
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => handleCommand(input)}
              // @ts-ignore - web keydown
              onKeyDown={handleKeyDown}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="type 'help' or any command..."
              placeholderTextColor="#475569"
              style={{
                flex: 1,
                color: '#f8fafc',
                fontSize: 14,
                fontFamily: Platform.OS === 'web' ? 'monospace' : 'SpaceMono',
                paddingVertical: 2,
                outlineStyle: 'none' as any,
              }}
            />
          </View>
        </ScrollView>

        {/* Quick Command Bar */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 10,
            backgroundColor: '#0f172a',
            borderTopWidth: 1,
            borderTopColor: '#1e293b',
          }}>
          <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginRight: 4, alignSelf: 'center' }}>
            Quick:
          </Text>
          {['help', 'skills', 'projects', 'weather London', 'cv', 'whoami', 'clear'].map((qc) => (
            <Pressable
              key={qc}
              onPress={() => handleCommand(qc)}
              style={({ pressed }) => ({
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
                backgroundColor: pressed ? '#334155' : '#1e293b',
              })}>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>{qc}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
