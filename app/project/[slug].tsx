import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

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
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { projects, loading } = useProjects();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const p = projects.find((x) => x.id === slug);
  const githubUrl = p?.github ?? '';
  const demoUrl = p?.demoUrl ?? '';
  const images = p?.images || [];
  const currentImage = images[selectedImageIndex] || images[0];

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

          {/* Dual High-Resolution Image Gallery */}
          {images.length > 0 && currentImage ? (
            <>
              <Heading sub="2 high-resolution screenshots explaining real production system operation">
                Production Architecture & Visual Interface
              </Heading>
              <Card accent>
                {/* Image Switcher Tabs */}
                <View style={styles.imageTabsHeader}>
                  <Text style={[styles.galleryTitle, { color: t.text }]}>
                    SCREENSHOT ({selectedImageIndex + 1} OF 2): {currentImage.caption}
                  </Text>
                  <View style={styles.tabsRow}>
                    {images.map((img, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => setSelectedImageIndex(idx)}
                        style={[
                          styles.tabBtn,
                          {
                            backgroundColor: selectedImageIndex === idx ? t.accent : t.cardAlt,
                            borderColor: selectedImageIndex === idx ? t.accent : t.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.tabBtnText,
                            { color: selectedImageIndex === idx ? '#05070A' : t.muted },
                          ]}>
                          View {idx + 1}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Primary High-Resolution Image View */}
                <View style={[styles.mainImageViewer, { borderColor: t.border }]}>
                  <Image
                    source={{ uri: currentImage.url }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                </View>

                {/* Caption & Deep Technical Breakdown */}
                <View style={[styles.captionCard, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
                  <Text style={[styles.captionHeader, { color: t.accent }]}>
                    🔍 How this architecture component operates:
                  </Text>
                  <Text style={[styles.captionBody, { color: t.text }]}>
                    {currentImage.technicalDetails}
                  </Text>
                </View>

                {/* Side-by-side Thumbnails to quickly view both */}
                <View style={styles.thumbnailRow}>
                  {images.map((img, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => setSelectedImageIndex(idx)}
                      style={[
                        styles.thumbContainer,
                        {
                          borderColor: selectedImageIndex === idx ? t.accent : t.border,
                          backgroundColor: t.cardAlt,
                        },
                      ]}>
                      <Image source={{ uri: img.url }} style={styles.thumbImage} resizeMode="cover" />
                      <Text style={[styles.thumbCaption, { color: t.muted }]} numberOfLines={1}>
                        {img.caption}
                      </Text>
                    </Pressable>
                  ))}
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
  imageTabsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  mainImageViewer: {
    width: '100%',
    height: 380,
    backgroundColor: '#05070A',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  captionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    gap: 4,
  },
  captionHeader: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  captionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  thumbContainer: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 6,
    gap: 4,
  },
  thumbImage: {
    width: '100%',
    height: 90,
    borderRadius: 6,
  },
  thumbCaption: {
    fontSize: 11,
    fontWeight: '700',
  },
});
