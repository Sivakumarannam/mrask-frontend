import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Pipeline } from '@/components/Pipeline';
import { ProjectArchitecture } from '@/components/ProjectArchitecture';
import { RAGDemo } from '@/components/RAGDemo';
import { WeatherDemo } from '@/components/WeatherDemo';
import { Button, Card, Chip, Heading, Screen, Stat } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { profile } from '@/data/profile';
import { projects as defaultProjects } from '@/data/projects';
import { openLink } from '@/lib/links';
import { useProjects } from '@/lib/useProjects';

export function generateStaticParams(): { slug: string }[] {
  return defaultProjects.map((p) => ({ slug: p.id }));
}

export default function ProjectDetail() {
  const t = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { projects, loading } = useProjects();

  const p = projects.find((x) => x.id === slug);
  const githubUrl = p?.github ?? '';
  const demoUrl = p?.demoUrl ?? '';
  const images = p?.images || [];
  const img1 = images[0];
  const img2 = images[1];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Button
          label={'\u2190 Back to Projects'}
          variant="secondary"
          onPress={() => {
            router.replace('/projects');
          }}
        />
      </View>

      {loading && !p ? <ActivityIndicator color={t.accent} style={{ marginTop: 40 }} /> : null}

      {!loading && !p ? (
        <Text style={{ color: t.text, fontSize: 18, marginTop: 30 }}>Project not found.</Text>
      ) : null}

      {p ? (
        <>
          {/* Main Hero Header Card */}
          <View style={{ marginTop: 20 }}>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: t.card,
                  borderColor: t.border,
                },
              ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Image
                  source={require('@/assets/images/profile-photo.png')}
                  style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 1, borderColor: t.border }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
                    ENGINEERED & DELIVERED BY
                  </Text>
                  <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>{profile.displayName}</Text>
                  <Text style={{ color: t.muted, fontSize: 12 }}>Associate Software Engineer (2+ Years)</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
                <Text style={{ color: t.text, fontSize: 28, fontWeight: '800' }}>{p.title}</Text>
                <Chip label={p.role} />
              </View>

              <Text style={{ color: t.accent, fontSize: 16, fontWeight: '700', marginTop: 6 }}>{p.tagline}</Text>
              <Text style={{ color: t.muted, fontSize: 15, lineHeight: 25, marginTop: 12 }}>{p.summary}</Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
                {githubUrl && githubUrl.trim() !== '' ? (
                  <Button label="GitHub Repository" onPress={() => openLink(githubUrl)} />
                ) : null}
                {demoUrl ? (
                  <Button label="Open Live Demo" variant="secondary" onPress={() => openLink(demoUrl)} />
                ) : null}
              </View>
            </View>
          </View>

          {/* Production Impact Metrics Grid */}
          {p.architecture?.metrics && (
            <>
              <Heading sub="Measurable performance gains achieved in production">
                Engineering Impact & Benchmarks
              </Heading>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {p.architecture.metrics.map((m) => (
                  <Stat key={m.label} label={m.label} value={m.value} />
                ))}
              </View>
            </>
          )}

          {/* Dual High-Resolution 2-Row Architecture Showcase */}
          {img1 && img2 ? (
            <>
              <Heading sub="2 high-resolution production architecture visual interfaces engineered in this project">
                Production Architecture & Visual Interfaces
              </Heading>
              <Card accent>
                <View style={{ gap: 20 }}>
                  {/* Row 1: Left Side Image 1, Right Side Description 1 */}
                  <View style={[styles.detailSplitRow, isMobile && styles.detailSplitRowStacked]}>
                    <View style={[styles.detailLeftImageWrapper, { borderColor: t.border }]}>
                      <Image
                        source={{ uri: img1.url }}
                        style={styles.detailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.detailBadgeOverlay}>
                        <Text style={styles.detailBadgeText}>VIEW 01 / ARCHITECTURE</Text>
                      </View>
                    </View>

                    <View style={[styles.detailRightDescCol, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
                      <Text style={[styles.detailViewTag, { color: t.accent }]}>
                        🔍 VIEW 01: SYSTEM TOPOLOGY & INGESTION
                      </Text>
                      <Text style={[styles.detailCaptionTitle, { color: t.text }]}>
                        {img1.caption}
                      </Text>
                      <Text style={[styles.detailCaptionBody, { color: t.muted }]}>
                        {img1.technicalDetails}
                      </Text>
                    </View>
                  </View>

                  {/* Row 2: Down Left Side View 2 Image, Right Side Description 2 */}
                  <View style={[styles.detailSplitRow, isMobile && styles.detailSplitRowStacked]}>
                    <View style={[styles.detailLeftImageWrapper, { borderColor: t.border }]}>
                      <Image
                        source={{ uri: img2.url }}
                        style={styles.detailImage}
                        resizeMode="cover"
                      />
                      <View style={styles.detailBadgeOverlay}>
                        <Text style={styles.detailBadgeText}>VIEW 02 / AUTOMATION RUNTIME</Text>
                      </View>
                    </View>

                    <View style={[styles.detailRightDescCol, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
                      <Text style={[styles.detailViewTag, { color: '#10B981' }]}>
                        ⚙️ VIEW 02: AUTONOMOUS RUNTIME & MITIGATION
                      </Text>
                      <Text style={[styles.detailCaptionTitle, { color: t.text }]}>
                        {img2.caption}
                      </Text>
                      <Text style={[styles.detailCaptionBody, { color: t.muted }]}>
                        {img2.technicalDetails}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            </>
          ) : null}

          {/* Live Interactive Demos */}
          {p.demoKind === 'weather' ? (
            <>
              <Heading sub="This demo calls the live Django API, which fetches geocoded meteorological telemetry.">
                Try it live: Real-Time Weather API
              </Heading>
              <Card accent>
                <WeatherDemo />
              </Card>
            </>
          ) : null}

          {p.demoKind === 'rag' ? (
            <>
              <Heading sub="Interactive document intelligence flow with local LLM reasoning & vector citations.">
                Try it live: RAG Document Q&A Studio
              </Heading>
              <Card accent>
                <RAGDemo />
              </Card>
            </>
          ) : null}

          {/* Architecture Blueprint & Description */}
          {p.architecture?.description && (
            <>
              <Heading sub="End-to-end data flow and architectural design patterns">
                Architecture Blueprint & Data Pipeline
              </Heading>
              <Card>
                <Text style={{ color: t.text, fontSize: 15, lineHeight: 24, marginBottom: 16 }}>
                  {p.architecture.description}
                </Text>

                <Text style={{ color: t.accent, fontSize: 13, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 }}>
                  PIPELINE EXECUTION STAGES:
                </Text>
                {p.architecture.flow.map((stage, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: t.navActive,
                        borderColor: t.accent,
                        borderWidth: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text style={{ color: t.accent, fontSize: 11, fontWeight: '800' }}>{idx + 1}</Text>
                    </View>
                    <Text style={{ color: t.muted, fontSize: 14, flex: 1 }}>{stage}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {p.demoKind ? (
            <>
              <Heading sub="Interactive system pipeline & component interconnections">
                Interactive System Topology
              </Heading>
              <ProjectArchitecture kind={p.demoKind} />
            </>
          ) : null}

          {p.steps && p.steps.length > 0 ? (
            <>
              <Heading sub="Execution lifecycle from trigger to verified completion">
                How it works: Step-by-Step
              </Heading>
              <Card>
                <Pipeline steps={p.steps} />
              </Card>
            </>
          ) : null}

          {/* What I Built Highlights */}
          <Heading sub="Key technical accomplishments & engineering deliverables">
            What I built & delivered
          </Heading>
          <Card>
            {p.highlights.map((h) => (
              <Text key={h} style={{ color: t.muted, fontSize: 15, lineHeight: 24, marginBottom: 6 }}>
                {'\u2022  '}
                {h}
              </Text>
            ))}
          </Card>

          {/* Tech Stack Chips */}
          <Heading sub="Technologies, protocols, and libraries utilized in this system">
            Tech stack
          </Heading>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 30 }}>
            {p.stack.map((s) => (
              <Chip key={s} label={s} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  detailSplitRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'stretch',
  },
  detailSplitRowStacked: {
    flexDirection: 'column',
  },
  detailLeftImageWrapper: {
    flex: 1.1,
    minHeight: 240,
    backgroundColor: '#05070A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  detailImage: {
    width: '100%',
    height: '100%',
    minHeight: 240,
  },
  detailBadgeOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(5, 7, 10, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  detailBadgeText: {
    color: '#D9E9FF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  detailRightDescCol: {
    flex: 1.1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 6,
  },
  detailViewTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  detailCaptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  detailCaptionBody: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
});
