import { Text } from 'react-native';

import { ProjectSkeletonCard } from '@/components/Skeleton';
import { ProjectCard } from '@/components/ProjectCard';
import { Heading, Screen } from '@/components/ui';
import { useTheme } from '@/constants/theme';
import { useProjects } from '@/lib/useProjects';

export default function Projects() {
  const t = useTheme();
  const { projects, loading, source } = useProjects();

  return (
    <Screen>
      <Heading sub="Explore the products I have built, with the code, architecture, and demos behind each one.">
        Projects
      </Heading>
      {source === 'api' ? (
        <Text style={{ color: t.accent2, fontWeight: '700', marginBottom: 14 }}>
          {'\u25CF  Live data from my Django + PostgreSQL API'}
        </Text>
      ) : null}
      {loading && projects.length === 0 ? (
        <>
          <ProjectSkeletonCard />
          <ProjectSkeletonCard />
        </>
      ) : null}
      {projects.map((p) => (
        <ProjectCard key={p.id} p={p} />
      ))}
    </Screen>
  );
}
