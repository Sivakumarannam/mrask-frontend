import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { Button, Card, Heading, Screen } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { sendMessage } from '@/lib/api';

export default function Contact() {
  const t = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const inputStyle = {
    color: t.text,
    backgroundColor: '#10171E',
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginTop: 6,
  } as const;

  async function submitMessage() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setFeedback({ text: 'Please fill in your name, email, and message.', isError: true });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFeedback({ text: 'Please enter a valid email address.', isError: true });
      return;
    }
    if (trimmedMessage.length < 5) {
      setFeedback({ text: 'Please make your message at least 5 characters long.', isError: true });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await sendMessage({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      if (result.email_sent === false) {
        setFeedback({
          text: result.detail ?? 'Your message was saved, but the email could not be delivered. Please try again later.',
          isError: true,
        });
        return;
      }
      setFeedback({
        text: result.detail ?? 'Your message was received.',
        isError: false,
      });
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setFeedback({
        text: error instanceof Error && error.name !== 'TypeError'
          ? error.message
          : 'The contact service could not be reached, so your message was not delivered. Please try again when the service is available.',
        isError: true,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Heading sub="Have a project in mind or want to talk about something I built? Send me a message.">
        Contact
      </Heading>

      <Card accent>
        <Text style={{ color: t.text, fontSize: 20, fontWeight: '800', marginBottom: 8 }}>
          Let’s connect
        </Text>
        <Text style={{ color: t.muted, fontSize: 16, lineHeight: 26 }}>
          All fields are required. I’ll use your email address to reply to your message.
        </Text>

        <View style={{ marginTop: 18, gap: 14 }}>
          <View>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>Name *</Text>
            <TextInput
              accessibilityLabel="Your name, required"
              autoCapitalize="words"
              autoComplete="name"
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={t.muted}
              returnKeyType="next"
              style={inputStyle}
              value={name}
            />
          </View>

          <View>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>Email *</Text>
            <TextInput
              accessibilityLabel="Your email address, required"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={t.muted}
              returnKeyType="next"
              style={inputStyle}
              value={email}
            />
          </View>

          <View>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>Message *</Text>
            <TextInput
              accessibilityLabel="Your message, required"
              autoCapitalize="sentences"
              multiline
              onChangeText={setMessage}
              placeholder="Tell me a little about what you have in mind..."
              placeholderTextColor={t.muted}
              style={[inputStyle, { minHeight: 140, textAlignVertical: 'top' }]}
              value={message}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={submitMessage}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              borderRadius: 12,
              backgroundColor: '#172330',
              borderWidth: 1,
              borderColor: '#2B3A4B',
              paddingHorizontal: 18,
              paddingVertical: 12,
              opacity: submitting ? 0.65 : pressed ? 0.8 : 1,
            })}>
            {submitting ? (
              <ActivityIndicator color={t.accent3} />
            ) : (
              <Text style={{ color: t.accent3, fontWeight: '800', fontSize: 14 }}>Send message</Text>
            )}
          </Pressable>

          {feedback ? (
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: feedback.isError ? '#FF8A8A' : '#8FE3B0', fontSize: 14, lineHeight: 21 }}>
              {feedback.text}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <Button label="Explore projects" onPress={() => router.push('/projects')} />
          <Button label="Back to home" variant="secondary" onPress={() => router.push('/')} />
        </View>
      </Card>
    </Screen>
  );
}
