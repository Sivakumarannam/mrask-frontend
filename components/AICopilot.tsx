import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { useTheme } from '@/constants/theme';
import { streamCopilot } from '@/lib/api';

type CopilotMessage = {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
};

const DEFAULT_SUGGESTIONS = [
  'What is Siva\'s tech stack?',
  'Tell me about the RAG Chatbot',
  'How do I contact or hire him?',
  'Explain the Weather App architecture',
];

function generateLocalCopilotAnswer(question: string): { answer: string; suggestions: string[] } {
  const q = question.toLowerCase();
  if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('reach') || q.includes('linkedin') || q.includes('connect')) {
    return {
      answer: "You can reach **Siva Kumar Annam (Mr.A.S.K)** directly:\n\n• 📧 **Email:** [sivakumarannam143@gmail.com](mailto:sivakumarannam143@gmail.com)\n• 💼 **LinkedIn:** [Siva Kumar Annam on LinkedIn](https://www.linkedin.com/in/siva-kumar-annam-5b0368203/)\n• 🐙 **GitHub:** [@Sivakumarannam](https://github.com/Sivakumarannam)\n• 📍 **Location:** Andhra Pradesh, India\n\nHe is actively **open to full-stack developer and AI engineering roles**.",
      suggestions: ["What is his tech stack?", "Tell me about the RAG Chatbot", "Show all projects"]
    };
  }
  if (q.includes('skill') || q.includes('stack') || q.includes('tech') || q.includes('python') || q.includes('django') || q.includes('react')) {
    return {
      answer: "**Siva Kumar Annam** specializes in full-stack engineering and AI systems:\n\n• **Frontend:** React Native (Expo SDK 57), React Native Web, TypeScript, JavaScript (ES6+), HTML5, CSS3, Bootstrap.\n• **Backend:** Python, Django 6.1, Django REST Framework, PostgreSQL with pgvector, SQLite, Gunicorn, WhiteNoise, Async background workers.\n• **AI & RAG:** Local LLMs (Ollama / Qwen2.5), Sentence-Transformers, FAISS vector indexing, PostgreSQL pgvector, real-time SSE token streaming.\n• **DevOps:** Docker, Vercel edge deployment, Render cloud services, GitHub Actions CI/CD automation.",
      suggestions: ["How does his RAG Chatbot work?", "Explain the Weather App architecture", "How do I contact him?"]
    };
  }
  if (q.includes('rag') || q.includes('chatbot') || q.includes('ollama') || q.includes('faiss') || q.includes('pdf')) {
    return {
      answer: "**RAG Chatbot** is Siva's on-premise Retrieval-Augmented Generation system:\n\n1. **Document Ingestion:** Ingests PDF / Text files and cleans text.\n2. **Semantic Chunking:** Splits text into 500-token chunks with context overlap.\n3. **Dense Embeddings:** Creates 384-dimensional dense vectors with `all-MiniLM-L6-v2`.\n4. **Vector Retrieval:** Indexes dense vectors in FAISS and PostgreSQL `pgvector` for sub-10ms cosine similarity retrieval.\n5. **Local Reasoning:** Uses local Ollama (Qwen2.5) with real-time SSE token streaming, guaranteeing 100% data privacy with zero cloud leak.",
      suggestions: ["Tell me about the Weather App", "What is his tech stack?", "How do I hire Siva?"]
    };
  }
  if (q.includes('weather') || q.includes('api') || q.includes('meteo')) {
    return {
      answer: "**Weather App** is a decoupled full-stack microservice:\n\n• **Backend API:** Django REST Framework proxying Open-Meteo geocoding and 5-day meteorological forecasts.\n• **Frontend Client:** React Native Web interface with animated temperature metrics and responsive forecast widgets.\n• **Resilience:** Intelligent city normalization, scoped rate throttling, and clean JSON serialization.",
      suggestions: ["How does the RAG Chatbot work?", "What is his tech stack?", "Get his contact info"]
    };
  }
  return {
    answer: "**Siva Kumar Annam (Mr.A.S.K)** is a Full-Stack Developer and AI Systems Engineer from Andhra Pradesh, India.\n\nHe engineers high-performance web applications, mobile apps with Expo, and on-premise RAG AI systems. Feel free to explore his projects or reach out directly at sivakumarannam143@gmail.com!",
    suggestions: ["What is his tech stack?", "Tell me about the RAG Chatbot", "How do I contact him?"]
  };
}

export function AICopilot() {
  const t = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'Hi there! I am **Mr.A.S.K\'s AI Co-Pilot**. Ask me anything about Siva\'s full-stack skills, RAG architecture, projects, or how to contact him.',
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

    try {
      await streamCopilot({
        message: textToSend,
        onToken: (token: string) => {
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
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset-' + Date.now(),
        sender: 'assistant',
        text: 'Thread cleared. What would you like to explore about Siva\'s engineering work?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSuggestions(DEFAULT_SUGGESTIONS);
  };

  return (
    <View
      style={{
        position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 9999,
      }}>
      {/* ─── Collapsed Floating Trigger ─── */}
      {!isOpen && (
        <Pressable
          onPress={() => setIsOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: t.card,
            borderColor: t.accent,
            borderWidth: 1.5,
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 30,
            shadowColor: t.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
          <Text style={{ color: t.text, fontSize: 14, fontWeight: '800' }}>
            💬 Ask Mr.A.S.K AI
          </Text>
          <View style={{ backgroundColor: t.navActive, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
            <Text style={{ color: t.accent, fontSize: 10, fontWeight: '800' }}>COPILOT</Text>
          </View>
        </Pressable>
      )}

      {/* ─── Expanded Chat Drawer ─── */}
      {isOpen && (
        <View
          style={{
            width: Platform.OS === 'web' ? 380 : 340,
            maxHeight: 560,
            height: 520,
            backgroundColor: t.cardAlt,
            borderColor: t.border,
            borderWidth: 1.5,
            borderRadius: 22,
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
              paddingHorizontal: 16,
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
                <Text style={{ color: t.muted, fontSize: 10 }}>Portfolio Intelligence AI</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={clearChat}>
                <Text style={{ color: t.muted, fontSize: 11 }}>Clear</Text>
              </Pressable>
              <Pressable onPress={() => setIsOpen(false)} style={{ padding: 4 }}>
                <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>✕</Text>
              </Pressable>
            </View>
          </View>

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

          {/* Quick Suggestion Chips */}
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderTopWidth: 1,
              borderTopColor: t.border,
              backgroundColor: t.card,
            }}>
            <Text style={{ color: t.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 }}>
              SUGGESTED QUESTIONS:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
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

          {/* Input Box */}
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              backgroundColor: t.cardAlt,
              borderTopWidth: 1,
              borderTopColor: t.border,
              gap: 8,
            }}>
            <TextInput
              value={inputMessage}
              onChangeText={setInputMessage}
              placeholder="Ask anything about Siva..."
              placeholderTextColor={t.muted}
              onSubmitEditing={() => handleSend()}
              editable={!isStreaming}
              style={{
                flex: 1,
                backgroundColor: t.card,
                color: t.text,
                borderColor: t.border,
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 13,
              }}
            />
            <Pressable
              onPress={() => handleSend()}
              disabled={isStreaming || !inputMessage.trim()}
              style={{
                backgroundColor: isStreaming || !inputMessage.trim() ? t.border : t.accent,
                paddingHorizontal: 14,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: isStreaming || !inputMessage.trim() ? t.muted : '#05070A', fontWeight: '800', fontSize: 13 }}>
                Send
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
