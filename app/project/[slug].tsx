import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Image, Text, View } from 'react-native';

import { Pipeline } from '@/components/Pipeline';
import { ProjectArchitecture } from '@/components/ProjectArchitecture';
import { RAGDemo } from '@/components/RAGDemo';
import { WeatherDemo } from '@/components/WeatherDemo';
import { Button, Card, Chip, Heading, Screen } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { profile } from '@/data/profile';
import { openLink } from '@/lib/links';
import { useProjects } from '@/lib/useProjects';

export default function ProjectDetail() {
  const t = useTheme();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { projects, loading } = useProjects();
  const p = projects.find((x) => x.id === slug);
  const githubUrl = p?.github ?? '';
  const demoUrl = p?.demoUrl ?? '';

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flexDirection: 'row', marginTop: 12 }}>
        <Button
          label={'\u2190 Back'}
          variant="secondary"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/projects');
            }
          }}
        />
      </View>

      {loading && !p ? <ActivityIndicator color={t.accent} style={{ marginTop: 40 }} /> : null}

      {!loading && !p ? (
        <Text style={{ color: t.text, fontSize: 18, marginTop: 30 }}>Project not found.</Text>
      ) : null}

      {p ? (
        <>
          <View style={{ marginTop: 20 }}>
            <View
              style={{
                backgroundColor: t.card,
                borderColor: t.border,
                borderWidth: 1,
                borderRadius: 20,
                padding: 18,
                marginBottom: 18,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Image
                  source={require('@/assets/images/profile-photo.png')}
                  style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 1, borderColor: t.border }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.muted, fontSize: 12, fontWeight: '700', letterSpacing: 0.8 }}>
                    BUILT BY
                  </Text>
                  <Text style={{ color: t.text, fontSize: 18, fontWeight: '800' }}>{profile.displayName}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
                <Text style={{ color: t.text, fontSize: 30, fontWeight: '800' }}>{p.title}</Text>
                <Chip label={p.role} />
              </View>
              <Text style={{ color: t.accent, fontSize: 17, fontWeight: '700', marginTop: 6 }}>{p.tagline}</Text>
              <Text style={{ color: t.muted, fontSize: 16, lineHeight: 26, marginTop: 12 }}>{p.summary}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
                <Button label="GitHub repo" onPress={() => openLink(githubUrl)} />
                {demoUrl ? (
                  <Button label="Open live demo" variant="secondary" onPress={() => openLink(demoUrl)} />
                ) : null}
              </View>
            </View>
          </View>

          {p.demoKind === 'weather' ? (
            <>
              <Heading sub="This demo calls the Django API, which fetches live data from a weather service.">
                Try it live
              </Heading>
              <Card accent>
                <WeatherDemo />
              </Card>
            </>
          ) : null}

          {p.demoKind === 'rag' ? (
            <>
              <Heading sub="This is a live local mock of the PDF Q&A RAG flow used in the project.">
                Try it live
              </Heading>
              <Card accent>
                <RAGDemo />
              </Card>
            </>
          ) : null}

          {p.demoKind ? (
            <>
              <Heading sub="Interactive system pipeline & component interconnections">
                Architecture Blueprint
              </Heading>
              <ProjectArchitecture kind={p.demoKind} />
            </>
          ) : null}

          {p.steps.length > 0 ? (
            <>
              <Heading sub="From input to result">How it works</Heading>
              <Card>
                <Pipeline steps={p.steps} />
              </Card>
            </>
          ) : null}

          <Heading>What I built</Heading>
          <Card>
            {p.highlights.map((h) => (
              <Text key={h} style={{ color: t.muted, fontSize: 16, lineHeight: 26 }}>
                {'\u2022  '}
                {h}
              </Text>
            ))}
          </Card>

          <Heading>Tech stack</Heading>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {p.stack.map((s) => (
              <Chip key={s} label={s} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}
