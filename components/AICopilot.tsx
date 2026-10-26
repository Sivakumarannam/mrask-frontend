import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { AudioWaveform } from '@/components/AudioWaveform';
import { useTheme } from '@/constants/theme';
import { profile } from '@/data/profile';
import { streamCopilot } from '@/lib/api';

type CopilotMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
};

const DEFAULT_SUGGESTIONS = [
  "What is Siva's tech stack?",
  'Tell me about his Tata Communications experience',
  'How does his RAG Chatbot work?',
  'How do I contact or hire Siva?',
];

function generateLocalCopilotAnswer(question: string): { answer: string; suggestions: string[] } {
  const q = question.toLowerCase();

  // Contact / Hire
  if (
    q.includes('contact') ||
    q.includes('hire') ||
    q.includes('email') ||
    q.includes('reach') ||
    q.includes('linkedin') ||
    q.includes('connect') ||
    q.includes('phone')
  ) {
    return {
      answer: `You can reach **${profile.name} (${profile.displayName})** directly:\n\n• 📱 **Phone:** [${profile.phone}](tel:${profile.phone.replace(/\s+/g, '')})\n• 📧 **Email:** [${profile.email}](mailto:${profile.email})\n• 💼 **LinkedIn:** [Siva Kumar Annam on LinkedIn](${profile.linkedin})\n• 🐙 **GitHub:** [@Sivakumarannam](${profile.github})\n• 📍 **Location:** ${profile.location}\n\nHe is actively **${profile.openTo}**.`,
      suggestions: [
        "What is his tech stack?",
        'Tell me about his Tata Communications experience',
        'Show all projects',
      ],
    };
  }

  // Work Experience / Company
  if (
    q.includes('experience') ||
    q.includes('company') ||
    q.includes('mastercom') ||
    q.includes('tata') ||
    q.includes('sevone') ||
    q.includes('role')
  ) {
    return {
      answer: `**${profile.name}** is an **Associate Software Engineer** with **2+ years of hands-on experience** at **MasterCom Technology Services India Pvt Ltd** (Client: **Tata Communications Ltd**).\n\nKey Engineering Highlights:\n• **Network Operational Automation:** Developed Python, Perl, and Shell scripts on SevOne NMS & DISHA (Assure1) that reduced manual operational effort by **35%**.\n• **Database Migrations:** Led MySQL → PostgreSQL database migrations with custom join rewrites, cutting query execution times by **2.5s**.\n• **RESTful APIs:** Engineered Python RESTful APIs with caching and query optimization, decreasing database strain by **30%**.\n• **Incident Management:** Correlated **5,000+ SNMP metrics and NetFlow flows**, reducing incident detection times from 45 to 20 minutes under strict ServiceNow SLAs.`,
      suggestions: [
        'What is his full tech stack?',
        'How does his RAG Chatbot work?',
        'How do I contact him?',
      ],
    };
  }

  // Skills / Stack
  if (
    q.includes('skill') ||
    q.includes('stack') ||
    q.includes('tech') ||
    q.includes('python') ||
    q.includes('django') ||
    q.includes('react')
  ) {
    return {
      answer: `**${profile.name}** has 2+ years of production experience across:\n\n• **Backend & APIs:** Python (Strong), Django 6.1, Django REST Framework, RESTful API Design, Async Workers.\n• **Frontend & Mobile:** React Native (Expo SDK 57), React Native Web, TypeScript, Next.js, HTML5/CSS3 Glassmorphism.\n• **AI & RAG:** Local LLMs (Ollama / Qwen2.5/Llama3), LangChain, Sentence-Transformers, FAISS dense vector search, PostgreSQL pgvector, real-time SSE streaming.\n• **Cloud & DevOps:** AWS (EC2, S3, RDS, Lambda), Docker, Kubernetes, Terraform IaC, Jenkins, GitHub Actions CI/CD.\n• **Databases & Telemetry:** PostgreSQL, MySQL, Redis, SevOne NMS, DISHA (Assure1), SNMP, NetFlow, ServiceNow.`,
      suggestions: [
        'Tell me about his Tata Communications work',
        'How does the RAG Chatbot work?',
        'Get his contact info',
      ],
    };
  }

  // RAG Chatbot
  if (q.includes('rag') || q.includes('chatbot') || q.includes('ollama') || q.includes('faiss') || q.includes('pdf')) {
    return {
      answer: `**RAG Document Intelligence Studio** is Siva's on-premise Retrieval-Augmented Generation project:\n\n1. **Ingestion & Extraction:** Extracts text from custom PDF and text documents using \`pypdf\`.\n2. **Semantic Chunking:** Splits text into context-preserved chunks with overlap.\n3. **Dense Embeddings:** Creates 384-dimensional dense vectors with \`all-MiniLM-L6-v2\`.\n4. **Vector Retrieval:** Indexes dense vectors in FAISS for sub-millisecond cosine similarity search.\n5. **Local Reasoning:** Uses local Ollama (Qwen2.5/Llama3) with real-time SSE token streaming, guaranteeing 100% data privacy with zero cloud leak.\n\nYou can test it live under \`/project/rag-chatbot\`!`,
      suggestions: [
        'Tell me about his Tata Communications experience',
        'What is his tech stack?',
        'How do I hire Siva?',
      ],
    };
  }

  // Weather App
  if (q.includes('weather') || q.includes('api') || q.includes('meteo')) {
    return {
      answer: `**Weather App** is a decoupled full-stack microservice demonstration:\n\n• **Backend API:** Django REST Framework proxying Open-Meteo geocoding and 5-day meteorological forecasts.\n• **Frontend Client:** React Native Web interface with animated temperature metrics and responsive forecast widgets.\n• **Resilience:** Intelligent city normalization, scoped rate throttling (30 req/min), and clean JSON serialization.\n\nYou can test it live under \`/project/weather-app\`!`,
      suggestions: [
        'How does the RAG Chatbot work?',
        'What is his full tech stack?',
        'Get his contact info',
      ],
    };
  }

  return {
    answer: `**${profile.name} (${profile.displayName})** is an Associate Software Engineer with **2+ years of experience** at **MasterCom Technology Services** (Client: **Tata Communications Ltd**).\n\nHe specializes in full-stack web applications, Python automation, and self-hosted RAG AI systems. Feel free to explore his projects or contact him directly at ${profile.email}!`,
    suggestions: [
      "What is his tech stack?",
      'Tell me about his Tata Communications experience',
      'How do I contact him?',
    ],
  };
}

type AICopilotProps = {
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  hideDefaultTrigger?: boolean;
};

export function AICopilot({
  isOpen: externalIsOpen,
  onOpen,
  onClose,
  hideDefaultTrigger = false,
}: AICopilotProps = {}) {
  const t = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    if (val) {
      if (onOpen) onOpen();
      setInternalIsOpen(true);
    } else {
      if (onClose) onClose();
      setInternalIsOpen(false);
    }
  };

  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  // Option 1: Voice Mode States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceResponseEnabled, setIsVoiceResponseEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hi there! I am **Mr.A.S.K's AI Co-Pilot**. Ask me anything about Siva's 2+ years of experience at MasterCom & Tata Communications, his RAG architecture, or his full-stack skills.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (isOpen && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 60);
    }
  }, [messages, isOpen]);

  // Voice Speech Synthesis (speaks response out loud)
  const speakText = (text: string) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !isVoiceResponseEnabled) return;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*#_`]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/[•\-\n]+/g, ' ')
        .trim();
      if (clean) {
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.rate = 1.05;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  // Voice Speech Recognition (Microphone input)
  const toggleVoiceInput = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSend = async (customText?: string) => {
    const textToSend = (customText ?? inputMessage).trim();
    if (!textToSend || isStreaming) return;

    setInputMessage('');
    const userMsgId = 'user-' + Date.now();
    const assistantMsgId = 'bot-' + Date.now();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', text: textToSend, timestamp: nowTime },
      { id: assistantMsgId, sender: 'assistant', text: '', timestamp: nowTime, isStreaming: true },
    ]);

    setIsStreaming(true);
    let accumulatedAnswer = '';

    try {
      await streamCopilot({
        message: textToSend,
        onToken: (token: string) => {
          accumulatedAnswer += token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId ? { ...msg, text: msg.text + token } : msg
            )
          );
        },
        onSuggestions: (newSuggestions: string[]) => {
          if (newSuggestions && newSuggestions.length > 0) {
            setSuggestions(newSuggestions);
          }
        },
      });
    } catch {
      // Instant intelligent fallback: streams grounded answer seamlessly
      const fallback = generateLocalCopilotAnswer(textToSend);
      setSuggestions(fallback.suggestions);
      accumulatedAnswer = fallback.answer;
      const words = fallback.answer.split(' ');
      for (let i = 0; i < words.length; i++) {
        const token = words[i] + (i < words.length - 1 ? ' ' : '');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, text: msg.text + token } : msg
          )
        );
        await new Promise((r) => setTimeout(r, 18));
      }
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
        )
      );
      if (accumulatedAnswer) {
        speakText(accumulatedAnswer);
      }
    }
  };

  const clearChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setMessages([
      {
        id: 'init-1',
        sender: 'assistant',
        text: `Chat cleared. Ask me anything about Siva's 2+ years of experience, SevOne NMS automation, or RAG architecture!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <View style={{ position: 'relative' }}>
      {/* Floating Trigger Button */}
      {!isOpen && !hideDefaultTrigger && (
        <Pressable
          onPress={() => setIsOpen(true)}
          accessibilityLabel="Open AI Co-Pilot chat"
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 99999,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: t.navActive,
            borderColor: t.accent,
            borderWidth: 1.5,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 30,
            shadowColor: t.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 8,
            opacity: pressed ? 0.85 : 1,
          })}>
          <Text style={{ fontSize: 18 }}>🤖</Text>
          <Text style={{ color: t.accent, fontWeight: '800', fontSize: 13 }}>
            Ask Mr.A.S.K AI
          </Text>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' }} />
        </Pressable>
      )}

      {/* Floating Co-Pilot Window */}
      {isOpen && (
        <View
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            zIndex: 99999,
            width: 380,
            maxWidth: '92%',
            height: 520,
            maxHeight: '82%',
            backgroundColor: t.card,
            borderColor: t.border,
            borderWidth: 1,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: t.card,
              borderBottomWidth: 1,
              borderBottomColor: t.border,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: t.navActive,
                  borderWidth: 1,
                  borderColor: t.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{ fontSize: 16 }}>🤖</Text>
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: t.text, fontSize: 14, fontWeight: '800' }}>Mr.A.S.K Co-Pilot</Text>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' }} />
                </View>
                <Text style={{ color: t.muted, fontSize: 10 }}>Portfolio Intelligence AI • Voice Ready</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* Voice Output Speaker Toggle */}
              <Pressable
                onPress={() => {
                  const nextState = !isVoiceResponseEnabled;
                  setIsVoiceResponseEnabled(nextState);
                  if (!nextState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 3,
                  borderRadius: 6,
                  backgroundColor: isVoiceResponseEnabled ? '#10b98122' : t.chip,
                  borderWidth: 1,
                  borderColor: isVoiceResponseEnabled ? '#10b981' : t.border,
                }}>
                <Text style={{ fontSize: 11, color: isVoiceResponseEnabled ? '#10b981' : t.muted }}>
                  {isVoiceResponseEnabled ? '🔊 Voice ON' : '🔇 Voice'}
                </Text>
              </Pressable>

              <Pressable onPress={clearChat}>
                <Text style={{ color: t.muted, fontSize: 11 }}>Clear</Text>
              </Pressable>
              <Pressable onPress={() => setIsOpen(false)} style={{ padding: 4 }}>
                <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* Listening Animated Waveform Bar */}
          {isListening && (
            <View
              style={{
                backgroundColor: '#10b98115',
                borderBottomWidth: 1,
                borderBottomColor: '#10b98155',
                paddingVertical: 6,
                paddingHorizontal: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' }} />
              <Text style={{ color: '#10b981', fontSize: 11, fontWeight: '800' }}>
                🎙️ Listening to your voice... Speak your question now!
              </Text>
            </View>
          )}

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1, padding: 14 }}
            contentContainerStyle={{ gap: 12 }}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    backgroundColor: isUser ? t.navActive : t.card,
                    borderColor: isUser ? t.accent : t.border,
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 12,
                  }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ color: isUser ? t.accent : t.muted, fontSize: 10, fontWeight: '800' }}>
                      {isUser ? 'YOU' : 'AI COPILOT'}
                    </Text>
                    <Text style={{ color: t.muted, fontSize: 9 }}>{msg.timestamp}</Text>
                  </View>
                  <Text style={{ color: t.text, fontSize: 13, lineHeight: 19 }}>
                    {msg.text}
                    {msg.isStreaming && <Text style={{ color: t.accent, fontWeight: '900' }}> ▌</Text>}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Suggestions Pill Carousel */}
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: t.card,
              borderTopWidth: 1,
              borderTopColor: t.border,
            }}>
            <Text style={{ color: t.muted, fontSize: 10, fontWeight: '700', marginBottom: 6 }}>
              SUGGESTED QUESTIONS:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}>
              {suggestions.map((s) => (
                <Pressable
                  key={s}
                  onPress={() => handleSend(s)}
                  style={{
                    backgroundColor: t.chip,
                    borderColor: t.border,
                    borderWidth: 1,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                  }}>
                  <Text style={{ color: t.chipText, fontSize: 11, fontWeight: '600' }}>{s}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Pro Audio Waveform Spectrum when listening or speaking */}
          <AudioWaveform
            active={isListening || isSpeaking}
            mode={isListening ? 'listening' : 'speaking'}
          />

          {/* Input Box with Microphone Voice Input Button */}
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              backgroundColor: t.cardAlt,
              borderTopWidth: 1,
              borderTopColor: t.border,
              gap: 8,
              alignItems: 'center',
            }}>
            <TextInput
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder={isListening ? 'Listening...' : 'Ask anything about Siva...'}
              placeholderTextColor={t.muted}
              onSubmitEditing={() => handleSend()}
              editable={!isStreaming && !isListening}
              style={{
                flex: 1,
                backgroundColor: t.card,
                color: t.text,
                borderColor: isListening ? '#10b981' : t.border,
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 13,
              }}
            />

            {/* Voice Input Microphone Button */}
            <Pressable
              onPress={toggleVoiceInput}
              disabled={isStreaming}
              style={{
                backgroundColor: isListening ? '#ef4444' : t.card,
                borderColor: isListening ? '#ef4444' : t.border,
                borderWidth: 1,
                width: 38,
                height: 38,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 16 }}>{isListening ? '⏹️' : '🎙️'}</Text>
            </Pressable>

            {/* Send Button */}
            <Pressable
              onPress={() => handleSend()}
              disabled={isStreaming || !inputMessage.trim()}
              style={{
                backgroundColor: isStreaming || !inputMessage.trim() ? t.border : t.accent,
                paddingHorizontal: 14,
                height: 38,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  color: isStreaming || !inputMessage.trim() ? t.muted : '#05070A',
                  fontWeight: '800',
                  fontSize: 13,
                }}>
                Send
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
