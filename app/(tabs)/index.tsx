import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { ArchitectureVisualizer } from '@/components/ArchitectureVisualizer';
import { GitHubLiveActivity } from '@/components/GitHubLiveActivity';
import { ProjectCard } from '@/components/ProjectCard';
import { Button, Card, Chip, Heading, Screen, Stat, Typewriter } from '@/components/ui';
import { gradient, useTheme } from '@/constants/theme';
import { profile, skillGroups } from '@/data/profile';
import { openGmail, openLink } from '@/lib/links';
import { useProjects } from '@/lib/useProjects';

export default function Home() {
  const t = useTheme();
  const router = useRouter();
  const { projects, loading } = useProjects();

  return (
    <Screen>
      <View style={{ paddingTop: 8 }}>
        <View
          style={{
            backgroundColor: t.card,
            borderColor: t.border,
            borderWidth: 1,
            borderRadius: 24,
            padding: 22,
            overflow: 'hidden',
          }}>
          <Text style={{ color: t.muted, fontSize: 18, fontWeight: '600', marginTop: 6 }}>
            Hello, I am
          </Text>
          <Text style={{ color: t.text, fontSize: 42, fontWeight: '800', lineHeight: 48, letterSpacing: -1.0 }}>
            {profile.name}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
            <Text style={{ color: t.text, fontSize: 22, fontWeight: '700' }}>I build </Text>
            <Typewriter
              words={profile.roles}
              style={{ color: t.accent, fontSize: 22, fontWeight: '800' }}
            />
          </View>

          <Text style={{ color: t.muted, fontSize: 16, lineHeight: 26, marginTop: 16, maxWidth: 680 }}>
            {profile.summary}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
            <Button label="Email me" onPress={() => openGmail()} />
            <Button label="Explore projects" variant="secondary" onPress={() => router.push('/projects')} />
            <Button label="GitHub" variant="secondary" onPress={() => openLink(profile.github)} />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
        <Stat value="2+ yrs" label="Production exp." />
        <Stat value={String(projects.length)} label="Enterprise & Solo" />
        <Stat value="3" label="Platforms" />
        <Stat value="Python" label="Django + Postgres" />
      </View>

      <Heading sub="Tools and technologies I use to deliver complete products">Skills</Heading>
      <Card accent>
        {skillGroups.map((g, idx) => (
          <View key={g.title} style={{ marginBottom: idx === skillGroups.length - 1 ? 0 : 16 }}>
            <Text style={{ color: t.text, fontWeight: '800', marginBottom: 8 }}>{g.title}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {g.items.map((s) => (
                <Chip key={s} label={s} />
              ))}
            </View>
          </View>
        ))}
      </Card>

      <Heading sub="Enterprise and open-source systems built and shipped with real-world impact">Featured projects</Heading>
      {loading ? <ActivityIndicator color={t.accent} style={{ marginVertical: 20 }} /> : null}
      {projects.map((p) => (
        <ProjectCard key={p.id} p={p} />
      ))}

      {/* Live Architecture Visualizer & Packet Tracer */}
      <View style={{ marginTop: 24 }}>
        <ArchitectureVisualizer />
      </View>

      {/* GitHub Live Activity Heatmap & Language Stats */}
      <View style={{ marginTop: 24 }}>
        <GitHubLiveActivity />
      </View>

      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 18, padding: 20, marginTop: 18 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800' }}>Want to work together?</Text>
        <Text style={{ color: '#EEF4FF', fontSize: 15, marginTop: 6, marginBottom: 16 }}>
          I would love to hear about your team, product, or next challenge.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Button label="Get in touch" variant="secondary" onPress={() => router.push('/contact')} />
          <Button label="Email me" variant="secondary" onPress={() => openGmail()} />
        </View>
      </LinearGradient>
    </Screen>
  );
}
