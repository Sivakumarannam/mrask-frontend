import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button, Card, Heading, Screen } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { sendMessage } from '@/lib/api';
import { openGmail } from '@/lib/links';

type ModalState = {
  visible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  senderName?: string;
  senderEmail?: string;
  deliveryStatus?: string;
  isSmtpConfigured?: boolean;
  sentMessageText?: string;
};

export default function Contact() {
  const t = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const getInputStyle = (field: string) => ({
    color: t.text,
    backgroundColor: t.inputBg,
    borderColor: focusedField === field ? t.accent : t.inputBorder,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginTop: 6,
    shadowColor: focusedField === field ? t.accent : 'transparent',
    shadowOpacity: focusedField === field ? 0.25 : 0,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  });

  async function submitMessage() {
    setFieldError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setFieldError('Please enter your name.');
      return;
    }
    if (!trimmedEmail) {
      setFieldError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFieldError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }
    if (trimmedMessage.length < 5) {
      setFieldError('Please write a message with at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await sendMessage({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
        website: honeypot,
      });

      const isSmtp = result.email_sent === true;

      // Success popup with accurate SMTP vs DB delivery state
      setModalState({
        visible: true,
        type: 'success',
        title: isSmtp ? 'Mail Dispatched Successfully!' : 'Message Saved to Database!',
        message: isSmtp
          ? `Thank you, ${trimmedName}! Your message was dispatched directly to my personal inbox via Gmail SMTP. I’ll review your note and get back to you at ${trimmedEmail} shortly.`
          : `Thank you, ${trimmedName}! Your message has been saved securely to Siva's production database. To guarantee instant delivery directly to his personal inbox, you can also click the 1-click Gmail button below.`,
        senderName: trimmedName,
        senderEmail: trimmedEmail,
        deliveryStatus: isSmtp
          ? '✓ Dispatched via Gmail SMTP'
          : '✓ Saved in PostgreSQL (SMTP Relay Pending)',
        isSmtpConfigured: isSmtp,
        sentMessageText: trimmedMessage,
      });

      // Clear the form fields upon success
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      const errorMsg =
        error instanceof Error && error.name !== 'TypeError'
          ? error.message
          : 'Could not connect to the backend server. Please make sure the service is running or reach out directly via Gmail.';

      setModalState({
        visible: true,
        type: 'error',
        title: 'Message Not Sent',
        message: errorMsg,
        senderName: trimmedName,
        senderEmail: trimmedEmail,
        sentMessageText: trimmedMessage,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Heading sub="Have a project in mind, an opportunity, or questions about my work? Let’s talk.">
        Contact Me
      </Heading>

      <Card accent>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: t.text, fontSize: 22, fontWeight: '800' }}>
            Send a Direct Message
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(52, 211, 153, 0.12)',
              borderColor: 'rgba(52, 211, 153, 0.3)',
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
            <View
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: '#34D399',
                marginRight: 6,
              }}
            />
            <Text style={{ color: '#34D399', fontSize: 12, fontWeight: '700' }}>Active SMTP</Text>
          </View>
        </View>

        <Text style={{ color: t.muted, fontSize: 15, lineHeight: 24 }}>
          Fill in the details below and hit send. You’ll receive an instant confirmation pop-up once your mail is delivered.
        </Text>

        <View style={{ marginTop: 20, gap: 16 }}>
          {/* Name Field */}
          <View>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>
              Your Name <Text style={{ color: '#7DB9FF' }}>*</Text>
            </Text>
            <TextInput
              accessibilityLabel="Your name, required"
              autoCapitalize="words"
              autoComplete="name"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(val) => {
                setName(val);
                if (fieldError) setFieldError(null);
              }}
              placeholder="e.g. Deadshot"
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              returnKeyType="next"
              style={getInputStyle('name')}
              value={name}
            />
          </View>

          {/* Email Field */}
          <View>
            <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>
              Your Email Address <Text style={{ color: '#7DB9FF' }}>*</Text>
            </Text>
            <TextInput
              accessibilityLabel="Your email address, required"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(val) => {
                setEmail(val);
                if (fieldError) setFieldError(null);
              }}
              placeholder="e.g. sivakumarannam2001@gmail.com"
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              returnKeyType="next"
              style={getInputStyle('email')}
              value={email}
            />
          </View>

          {/* Message Field */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>
                Your Message <Text style={{ color: '#7DB9FF' }}>*</Text>
              </Text>
              <Text style={{ color: t.muted, fontSize: 12 }}>
                {message.length} characters
              </Text>
            </View>
            <TextInput
              accessibilityLabel="Your message, required"
              autoCapitalize="sentences"
              multiline
              onFocus={() => setFocusedField('message')}
              onBlur={() => setFocusedField(null)}
              onChangeText={(val) => {
                setMessage(val);
                if (fieldError) setFieldError(null);
              }}
              placeholder="I have a project in mind and would love to collaborate..."
              placeholderTextColor="rgba(255, 255, 255, 0.35)"
              style={[
                getInputStyle('message'),
                { minHeight: 130, textAlignVertical: 'top', lineHeight: 22 },
              ]}
              value={message}
            />
          </View>

          {/* Honeypot Anti-Spam Field (hidden from human visitors, traps spam bots) */}
          <View style={{ opacity: 0, height: 0, width: 0, overflow: 'hidden', position: 'absolute' }}>
            <Text>Leave this field empty</Text>
            <TextInput
              autoComplete="off"
              onChangeText={setHoneypot}
              tabIndex={-1}
              value={honeypot}
            />
          </View>

          {/* Field validation error alert */}
          {fieldError ? (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderColor: 'rgba(239, 68, 68, 0.35)',
                borderWidth: 1,
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}>
              <Text style={{ color: '#F87171', fontSize: 15, fontWeight: '800' }}>⚠</Text>
              <Text style={{ color: '#FCA5A5', fontSize: 14, fontWeight: '600', flex: 1 }}>
                {fieldError}
              </Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            disabled={submitting}
            onPress={submitMessage}
            style={({ pressed }) => ({
              borderRadius: 14,
              overflow: 'hidden',
              alignSelf: 'flex-start',
              opacity: submitting ? 0.7 : pressed ? 0.88 : 1,
              shadowColor: '#3B82F6',
              shadowOpacity: 0.3,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 4 },
            })}>
            <LinearGradient
              colors={['#1E3A8A', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 26,
                paddingVertical: 14,
                borderRadius: 14,
              }}>
              {submitting ? (
                <>
                  <ActivityIndicator color="#FFFFFF" size="small" />
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                    Sending email...
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ color: '#FFFFFF', fontSize: 16 }}>✉</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 0.2 }}>
                    Send Message
                  </Text>
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 26,
            paddingTop: 18,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.08)',
          }}>
          <Button label="Explore Projects" onPress={() => router.push('/projects')} />
          <Button label="Back to Home" variant="secondary" onPress={() => router.push('/')} />
          <Button
            label="Open in Gmail App"
            variant="secondary"
            onPress={() => openGmail('Hello Siva - Reaching Out', message || '')}
          />
        </View>
      </Card>

      {/* POP-UP CONFIRMATION MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalState.visible}
        onRequestClose={() => setModalState((prev) => ({ ...prev, visible: false }))}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(2, 6, 12, 0.82)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
          <View
            style={{
              width: '100%',
              maxWidth: 520,
              backgroundColor: t.card,
              borderColor:
                modalState.type === 'success'
                  ? 'rgba(52, 211, 153, 0.4)'
                  : 'rgba(239, 68, 68, 0.4)',
              borderWidth: 1.5,
              borderRadius: 24,
              padding: 26,
              shadowColor: modalState.type === 'success' ? '#10B981' : '#EF4444',
              shadowOpacity: 0.25,
              shadowRadius: 28,
              shadowOffset: { width: 0, height: 10 },
              overflow: 'hidden',
            }}>
            {/* Top accent bar */}
            <LinearGradient
              colors={
                modalState.type === 'success'
                  ? ['#10B981', '#3B82F6']
                  : ['#EF4444', '#DC2626']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
            />

            {/* Icon & Title */}
            <View style={{ alignItems: 'center', marginBottom: 16, marginTop: 4 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor:
                    modalState.type === 'success'
                      ? 'rgba(16, 185, 129, 0.16)'
                      : 'rgba(239, 68, 68, 0.16)',
                  borderColor:
                    modalState.type === 'success'
                      ? 'rgba(16, 185, 129, 0.4)'
                      : 'rgba(239, 68, 68, 0.4)',
                  borderWidth: 1.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '900',
                    color: modalState.type === 'success' ? '#34D399' : '#F87171',
                  }}>
                  {modalState.type === 'success' ? '✓' : '⚠'}
                </Text>
              </View>

              <Text
                style={{
                  color: t.text,
                  fontSize: 23,
                  fontWeight: '800',
                  textAlign: 'center',
                  letterSpacing: -0.4,
                }}>
                {modalState.title}
              </Text>
            </View>

            {/* Message Body */}
            <Text
              style={{
                color: t.muted,
                fontSize: 15,
                lineHeight: 24,
                textAlign: 'center',
                marginBottom: 20,
              }}>
              {modalState.message}
            </Text>

            {/* Information snapshot card */}
            {modalState.type === 'success' ? (
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderColor: 'rgba(255, 255, 255, 0.08)',
                  borderWidth: 1,
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 22,
                  gap: 8,
                }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: t.muted, fontSize: 13 }}>Delivered To:</Text>
                  <Text style={{ color: '#E5E7EB', fontSize: 13, fontWeight: '700' }}>
                    sivakumarannam143@gmail.com
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: t.muted, fontSize: 13 }}>Reply Sent From:</Text>
                  <Text style={{ color: '#7DB9FF', fontSize: 13, fontWeight: '700' }}>
                    {modalState.senderEmail}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: t.muted, fontSize: 13 }}>Delivery Status:</Text>
                  <Text
                    style={{
                      color: modalState.isSmtpConfigured ? '#34D399' : '#38BDF8',
                      fontSize: 13,
                      fontWeight: '700',
                    }}>
                    {modalState.deliveryStatus || '✓ Saved in Database'}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'column', gap: 10, width: '100%' }}>
              <Pressable
                onPress={() => {
                  setModalState((prev) => ({ ...prev, visible: false }));
                  openGmail(
                    `Portfolio Message from ${modalState.senderName || 'Visitor'}`,
                    modalState.sentMessageText || message || ''
                  );
                }}
                style={({ pressed }) => ({
                  width: '100%',
                  borderRadius: 12,
                  backgroundColor: '#1E3A8A',
                  borderColor: '#3B82F6',
                  borderWidth: 1.5,
                  paddingVertical: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.85 : 1,
                })}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                  ✉️ Send Direct to Siva via Gmail (Guaranteed 1-Click)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setModalState((prev) => ({ ...prev, visible: false }))}
                style={({ pressed }) => ({
                  width: '100%',
                  borderRadius: 12,
                  overflow: 'hidden',
                  opacity: pressed ? 0.85 : 1,
                })}>
                <LinearGradient
                  colors={
                    modalState.type === 'success'
                      ? ['#059669', '#10B981']
                      : ['#374151', '#4B5563']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 13,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 12,
                  }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
                    Awesome, Got It!
                  </Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

