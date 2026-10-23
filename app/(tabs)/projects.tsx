import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';

import { ProjectSkeletonCard } from '@/components/Skeleton';
import { ProjectCard } from '@/components/ProjectCard';
import { Heading, Screen } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { useProjects } from '@/lib/useProjects';

const TECH_PILLS = [
  { id: 'all', label: 'All Projects' },
  { id: 'ai', label: '🧠 AI & RAG' },
  { id: 'django', label: '🐍 Python / Django' },
  { id: 'react', label: '⚛️ React Native / Expo' },
  { id: 'api', label: '⚡ APIs & Microservices' },
];

export default function Projects() {
  const t = useTheme();
  const { projects, loading, source } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('all');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // 1. Tech pill filter
      if (selectedTech === 'ai') {
        const isAi = p.stack.some((s) => /rag|faiss|ollama|transformer|ai|vector/i.test(s)) || /rag|ai/i.test(p.title);
        if (!isAi) return false;
      } else if (selectedTech === 'django') {
        const isDjango = p.stack.some((s) => /django|python|drf/i.test(s));
        if (!isDjango) return false;
      } else if (selectedTech === 'react') {
        const isReact = p.stack.some((s) => /react|expo|mobile/i.test(s));
        if (!isReact) return false;
      } else if (selectedTech === 'api') {
        const isApi = p.stack.some((s) => /rest|api|fastapi|django/i.test(s)) || p.demoKind === 'weather';
        if (!isApi) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesTagline = p.tagline.toLowerCase().includes(q);
        const matchesSummary = p.summary.toLowerCase().includes(q);
        const matchesStack = p.stack.some((s) => s.toLowerCase().includes(q));
        const matchesHighlights = p.highlights?.some((h) => h.toLowerCase().includes(q));

        if (!matchesTitle && !matchesTagline && !matchesSummary && !matchesStack && !matchesHighlights) {
          return false;
        }
      }

      return true;
    });
  }, [projects, selectedTech, searchQuery]);

  return (
    <Screen>
      <Heading sub="Explore production products engineered by Siva with full code, architecture diagrams, and interactive live demos.">
        Projects & Portfolio
      </Heading>

      {source === 'api' ? (
        <Text style={{ color: t.accent2, fontWeight: '700', marginBottom: 14 }}>
          {'\u25CF  Live data synchronized from Django + PostgreSQL API'}
        </Text>
      ) : null}

      {/* Dynamic Search & Filter Bar */}
      <View
        style={{
          backgroundColor: t.card,
          padding: 16,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: t.border,
          marginBottom: 20,
          gap: 12,
        }}>
        {/* Search Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: t.inputBg,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: t.inputBorder,
            paddingHorizontal: 12,
          }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search projects, technologies (e.g. Django, RAG, Expo)..."
            placeholderTextColor={t.muted}
            style={{
              flex: 1,
              color: t.text,
              fontSize: 14,
              paddingVertical: 10,
              outlineStyle: 'none' as any,
            }}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Text style={{ color: t.muted, fontWeight: '700', fontSize: 13 }}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Tech Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {TECH_PILLS.map((pill) => {
            const active = selectedTech === pill.id;
            return (
              <Pressable
                key={pill.id}
                onPress={() => setSelectedTech(pill.id)}
                style={({ pressed }) => ({
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: active ? t.accent : t.chip,
                  borderWidth: 1,
                  borderColor: active ? t.accent : t.border,
                  opacity: pressed ? 0.8 : 1,
                })}>
                <Text
                  style={{
                    color: active ? '#ffffff' : t.chipText,
                    fontSize: 12,
                    fontWeight: active ? '800' : '600',
                  }}>
                  {pill.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Results Counter */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: t.muted, fontSize: 12, fontWeight: '600' }}>
            Showing {filteredProjects.length} of {projects.length} projects
          </Text>
          {(searchQuery || selectedTech !== 'all') && (
            <Pressable
              onPress={() => {
                setSearchQuery('');
                setSelectedTech('all');
              }}>
              <Text style={{ color: t.accent, fontSize: 12, fontWeight: '700' }}>
                Reset Filters ↺
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Loading Skeletons */}
      {loading && projects.length === 0 ? (
        <>
          <ProjectSkeletonCard />
          <ProjectSkeletonCard />
        </>
      ) : null}

      {/* Filtered Project Cards */}
      {filteredProjects.map((p) => (
        <ProjectCard key={p.id} p={p} />
      ))}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <View
          style={{
            padding: 36,
            alignItems: 'center',
            backgroundColor: t.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: t.border,
            marginTop: 10,
          }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
          <Text style={{ color: t.text, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>
            No matching projects found
          </Text>
          <Text style={{ color: t.muted, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>
            Try searching for other keywords like "Django", "RAG", "Python", or "Weather".
          </Text>
          <Pressable
            onPress={() => {
              setSearchQuery('');
              setSelectedTech('all');
            }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: t.accent,
            }}>
            <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>
              View All Projects
            </Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}
