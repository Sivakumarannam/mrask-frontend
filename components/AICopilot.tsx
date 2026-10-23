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
    } catch (error) {
      const errMsg =
        error instanceof Error && !error.message.includes('fetch') && !error.message.includes('NetworkError')
          ? error.message
          : 'Siva\'s backend API is waking up (~30s cold start). Please wait a moment and tap again.';

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId ? { ...msg, text: errMsg, isStreaming: false } : msg
        )
      );
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
