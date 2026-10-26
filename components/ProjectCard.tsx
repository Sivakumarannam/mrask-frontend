import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import type { Project } from '@/data/projects';
import { openLink } from '@/lib/links';

export function ProjectCard({ p }: { p: Project }) {
  const t = useTheme();
  const router = useRouter();

  const images = p.images || [];

  return (
    <Card accent>
      {/* Title & Role Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: t.text }]}>{p.title}</Text>
          <View style={[styles.roleBadge, { backgroundColor: t.chip, borderColor: t.border }]}>
            <Text style={[styles.roleText, { color: t.chipText }]}>{p.role}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.tagline, { color: t.accent }]}>{p.tagline}</Text>
      <Text style={[styles.summary, { color: t.muted }]}>{p.summary}</Text>

      {/* 2-Image Showcase: Left Side Image View 1 & Right Side Description | Left Side Image View 2 & Right Side Description */}
      {images.length >= 2 ? (
        <View style={[styles.dualShowcaseBox, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
          <View style={styles.showcaseHeader}>
            <Text style={[styles.showcaseLabel, { color: t.accent }]}>
              📸 SYSTEM SCREENSHOTS & DETAILED BREAKDOWNS (2 VIEWS)
            </Text>
          </View>

          {/* Row 1: Left Side Image View 1, Right Side Description View 1 */}
          <View style={styles.splitRow}>
            <Pressable
              onPress={() => router.push(('/project/' + p.id) as any)}
              style={[styles.leftImageWrapper, { borderColor: t.border }]}>
              <Image
                source={{ uri: images[0].url }}
                style={styles.showcaseImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlayBadge}>
                <Text style={styles.overlayBadgeText}>🖼️ View 1 Image (Click to Expand)</Text>
              </View>
            </Pressable>

            <View style={[styles.rightDescCol, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.badgePillRow}>
                <Text style={[styles.viewPill, { color: t.accent, borderColor: t.accent }]}>
                  VIEW 1 DESCRIPTION / ARCHITECTURE
                </Text>
              </View>
              <Text style={[styles.captionTitle, { color: t.text }]}>
                {images[0].caption}
              </Text>
              <Text style={[styles.captionDetails, { color: t.muted }]}>
                {images[0].technicalDetails}
              </Text>
            </View>
          </View>

          {/* Row 2: Down Left Side Image View 2, Right Side Description View 2 */}
          <View style={[styles.splitRow, { marginTop: 14 }]}>
            <Pressable
              onPress={() => router.push(('/project/' + p.id) as any)}
              style={[styles.leftImageWrapper, { borderColor: t.border }]}>
              <Image
                source={{ uri: images[1].url }}
                style={styles.showcaseImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlayBadge}>
                <Text style={styles.overlayBadgeText}>🖼️ View 2 Image (Click to Expand)</Text>
              </View>
            </Pressable>

            <View style={[styles.rightDescCol, { backgroundColor: t.card, borderColor: t.border }]}>
              <View style={styles.badgePillRow}>
                <Text style={[styles.viewPill, { color: '#10B981', borderColor: '#10B981' }]}>
                  VIEW 2 DESCRIPTION / RUNTIME OPERATIONS
                </Text>
              </View>
              <Text style={[styles.captionTitle, { color: t.text }]}>
                {images[1].caption}
              </Text>
              <Text style={[styles.captionDetails, { color: t.muted }]}>
                {images[1].technicalDetails}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Feature Highlights */}
      <Text style={[styles.sectionHeading, { color: t.text }]}>What I engineered & delivered</Text>
      {p.highlights.slice(0, 3).map((h) => (
        <Text key={h} style={[styles.bulletPoint, { color: t.muted }]}>
          {'\u2022  '}
          {h}
        </Text>
      ))}

      {/* Tech Stack Chips */}
      <View style={styles.chipsRow}>
        {p.stack.map((s) => (
          <Chip key={s} label={s} />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <Button label="Explore Deep Dive →" onPress={() => router.push(('/project/' + p.id) as any)} />
        {p.github && p.github.trim() !== '' ? (
          <Button label="GitHub Repo" variant="secondary" onPress={() => openLink(p.github)} />
        ) : null}
        {p.demoUrl ? (
          <Button label="Live Demo" variant="secondary" onPress={() => openLink(p.demoUrl as string)} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  summary: {
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  dualShowcaseBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginTop: 18,
    marginBottom: 8,
    overflow: 'hidden',
  },
  showcaseHeader: {
    marginBottom: 12,
  },
  showcaseLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  splitRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 14,
    alignItems: 'stretch',
  },
  leftImageWrapper: {
    flex: 1,
    minHeight: 180,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#05070A',
    borderWidth: 1,
    position: 'relative',
  },
  showcaseImage: {
    width: '100%',
    height: '100%',
    minHeight: 180,
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(5, 7, 10, 0.82)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  overlayBadgeText: {
    color: '#D9E9FF',
    fontSize: 10,
    fontWeight: '700',
  },
  rightDescCol: {
    flex: 1.15,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  badgePillRow: {
    marginBottom: 4,
  },
  viewPill: {
    alignSelf: 'flex-start',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  captionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  captionDetails: {
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeading: {
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 3,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 14,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
});
