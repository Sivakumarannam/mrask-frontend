import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, Card, Chip } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import type { Project } from '@/data/projects';
import { openLink } from '@/lib/links';

export function ProjectCard({ p }: { p: Project }) {
  const t = useTheme();
  const router = useRouter();

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, flex: 1 }}>
          <Text style={{ color: t.text, fontSize: 22, fontWeight: '800' }}>{p.title}</Text>
          <Chip label={p.role} />
        </View>
      </View>
      <Text style={{ color: t.accent, fontSize: 15, fontWeight: '700', marginTop: 6 }}>{p.tagline}</Text>
      <Text style={{ color: t.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>{p.summary}</Text>

      {p.demoKind ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <View
            style={{
              backgroundColor: t.navActive,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}>
            <Text style={{ fontSize: 13 }}>{p.demoKind === 'rag' ? '🧠' : '⛅'}</Text>
            <Text style={{ color: t.accent, fontSize: 12, fontWeight: '700' }}>
              {p.demoKind === 'rag'
                ? 'Local Ollama & FAISS Architecture Included'
                : 'Live Open-Meteo REST Pipeline Included'}
            </Text>
          </View>
        </View>
      ) : null}

      <Text style={{ color: t.text, fontWeight: '700', marginTop: 14, marginBottom: 8 }}>What I built</Text>
      {p.highlights.slice(0, 3).map((h) => (
        <Text key={h} style={{ color: t.muted, fontSize: 15, lineHeight: 22 }}>
          {'\u2022  '}
          {h}
        </Text>
      ))}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        {p.stack.map((s) => (
          <Chip key={s} label={s} />
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
        <Button label="View details" onPress={() => router.push(('/project/' + p.id) as any)} />
        <Button label="GitHub" variant="secondary" onPress={() => openLink(p.github)} />
        {p.demoUrl ? (
          <Button
            label="Live demo"
            variant="secondary"
            onPress={() => openLink(p.demoUrl as string)}
          />
        ) : null}
      </View>
    </Card>
  );
}
