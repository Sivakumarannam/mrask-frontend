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
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images = p.images || [];
  const currentImage = images[activeImageIndex] || images[0];

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

      {/* 2-Image Interactive Gallery Box */}
      {images.length > 0 && currentImage ? (
        <View style={[styles.galleryContainer, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
          {/* Gallery Header & Image Switcher Tabs */}
          <View style={styles.galleryHeader}>
            <Text style={[styles.galleryLabel, { color: t.muted }]}>
              SYSTEM SCREENSHOTS & ARCHITECTURE ({activeImageIndex + 1}/2)
            </Text>
            <View style={styles.tabsRow}>
              {images.map((img, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setActiveImageIndex(idx)}
                  style={[
                    styles.imgTab,
                    {
                      backgroundColor: activeImageIndex === idx ? t.accent : t.card,
                      borderColor: activeImageIndex === idx ? t.accent : t.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.imgTabText,
                      { color: activeImageIndex === idx ? '#05070A' : t.muted },
                    ]}>
                    View {idx + 1}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Interactive Image Frame */}
          <Pressable
            onPress={() => router.push(('/project/' + p.id) as any)}
            style={styles.imageWrapper}>
            <Image
              source={{ uri: currentImage.url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlayBadge}>
              <Text style={styles.overlayBadgeText}>🔍 Click to open full deep-dive</Text>
            </View>
          </Pressable>

          {/* Image Caption & Technical Breakdown */}
          <View style={styles.captionBox}>
            <Text style={[styles.captionTitle, { color: t.text }]}>
              {currentImage.caption}
            </Text>
            <Text style={[styles.captionDetails, { color: t.muted }]}>
              {currentImage.technicalDetails}
            </Text>
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
  galleryContainer: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginTop: 16,
    marginBottom: 6,
    overflow: 'hidden',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  imgTab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  imgTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  imageWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#05070A',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(5, 7, 10, 0.8)',
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
  captionBox: {
    marginTop: 10,
    gap: 3,
  },
  captionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  captionDetails: {
    fontSize: 12,
    lineHeight: 17,
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
