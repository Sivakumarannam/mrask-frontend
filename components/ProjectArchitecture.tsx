import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

type Props = {
  kind: 'rag' | 'weather' | string;
};

export function ProjectArchitecture({ kind }: Props) {
  const t = useTheme();

  if (kind === 'rag') {
    const steps = [
      { step: '01', icon: '📄', title: 'Document Ingestion', desc: 'Accepts PDF files via multipart upload & extracts raw textual content' },
      { step: '02', icon: '✂️', title: 'Text Chunking', desc: 'Recursive character splitter divides text into overlapping 500-token segments' },
      { step: '03', icon: '🧠', title: 'Vector Embeddings', desc: 'Sentence-Transformers maps semantic tokens to 384-dim dense vectors' },
      { step: '04', icon: '🗄️', title: 'FAISS Indexing', desc: 'In-memory similarity index performs L2/cosine distance candidate retrieval' },
      { step: '05', icon: '🤖', title: 'Local Ollama LLM', desc: 'Qwen2.5 synthesizes grounded responses strictly from retrieved context' },
      { step: '06', icon: '💬', title: 'Interactive Output', desc: 'Delivers precise answer with matched document citations & excerpts' },
    ];

    const badges = [
      { label: '🔒 100% On-Premise / Private' },
      { label: '⚡ Zero Cloud API Costs' },
      { label: '🎯 Grounded Anti-Hallucination' },
    ];

    return (
      <View style={[styles.container, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: t.text }]}>System Architecture Pipeline</Text>
          <View style={[styles.badgePill, { backgroundColor: t.navActive }]}>
            <Text style={[styles.badgePillText, { color: t.accent }]}>Local RAG Flow</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          {badges.map((b) => (
            <View key={b.label} style={[styles.statChip, { backgroundColor: t.chip, borderColor: t.border }]}>
              <Text style={[styles.statChipText, { color: t.chipText }]}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* Pipeline Flow Grid */}
        <View style={styles.grid}>
          {steps.map((item, idx) => (
            <View
              key={item.step}
              style={[
                styles.stepCard,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                },
              ]}>
              <View style={styles.stepTopRow}>
                <Text style={styles.stepIcon}>{item.icon}</Text>
                <Text style={[styles.stepNumber, { color: t.accent }]}>{item.step}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: t.text }]}>{item.title}</Text>
              <Text style={[styles.stepDesc, { color: t.muted }]}>{item.desc}</Text>
              {idx < steps.length - 1 && (
                <View style={[styles.flowIndicator, { backgroundColor: t.accent2 }]}>
                  <Text style={styles.flowArrow}>↓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (kind === 'weather') {
    const steps = [
      { step: '01', icon: '🔍', title: 'Client Search', desc: 'User enters target city in Expo Web, iOS, or Android interface' },
      { step: '02', icon: '🌐', title: 'Django REST API', desc: 'Endpoint receives query, validates inputs, and checks throttle limits' },
      { step: '03', icon: '📍', title: 'Geocoding Resolver', desc: 'Resolves place names into precise latitude, longitude, and elevation' },
      { step: '04', icon: '⛅', title: 'Open-Meteo Ingestion', desc: 'Fetches real-time temperature, wind, humidity, and 5-day daily forecast' },
      { step: '05', icon: '🧹', title: 'Payload Sanitizer', desc: 'Normalizes WMO codes into weather conditions and emoji icons' },
      { step: '06', icon: '📱', title: 'Universal Render', desc: 'Cross-platform reactive presentation with responsive temperature badges' },
    ];

    const badges = [
      { label: '🌍 Live Open-Meteo API' },
      { label: '🛡️ Rate-Limited Backend' },
      { label: '📲 Universal Cross-Platform' },
    ];

    return (
      <View style={[styles.container, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: t.text }]}>API Integration Architecture</Text>
          <View style={[styles.badgePill, { backgroundColor: t.navActive }]}>
            <Text style={[styles.badgePillText, { color: t.accent }]}>REST Pipeline</Text>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          {badges.map((b) => (
            <View key={b.label} style={[styles.statChip, { backgroundColor: t.chip, borderColor: t.border }]}>
              <Text style={[styles.statChipText, { color: t.chipText }]}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* Pipeline Flow Grid */}
        <View style={styles.grid}>
          {steps.map((item, idx) => (
            <View
              key={item.step}
              style={[
                styles.stepCard,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                },
              ]}>
              <View style={styles.stepTopRow}>
                <Text style={styles.stepIcon}>{item.icon}</Text>
                <Text style={[styles.stepNumber, { color: t.accent }]}>{item.step}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: t.text }]}>{item.title}</Text>
              <Text style={[styles.stepDesc, { color: t.muted }]}>{item.desc}</Text>
              {idx < steps.length - 1 && (
                <View style={[styles.flowIndicator, { backgroundColor: t.accent2 }]}>
                  <Text style={styles.flowArrow}>↓</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  statChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    gap: 12,
  },
  stepCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    position: 'relative',
  },
  stepTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  stepIcon: {
    fontSize: 22,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  flowIndicator: {
    display: 'none',
  },
  flowArrow: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
