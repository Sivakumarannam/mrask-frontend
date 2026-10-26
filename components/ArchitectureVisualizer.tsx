import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform, Dimensions } from 'react-native';
import { useTheme } from '@/constants/theme';

type ArchitectureHop = {
  id: string;
  name: string;
  role: string;
  tech: string;
  status: 'idle' | 'active' | 'passed';
  latency: string;
  detail: string;
};

const INITIAL_HOPS: ArchitectureHop[] = [
  {
    id: 'client',
    name: '1. Client Browser',
    role: 'User Interface',
    tech: 'React Native Web / Expo SDK 57',
    status: 'idle',
    latency: '0 ms',
    detail: 'Encodes request, checks local storage & initiates SSE ReadableStream',
  },
  {
    id: 'edge',
    name: '2. Vercel & Cloudflare CDN',
    role: 'Global Edge Proxy',
    tech: 'HTTP/2, SSL Termination',
    status: 'idle',
    latency: '+14 ms',
    detail: 'Terminates HTTPS, applies HSTS, caches static assets & forwards to origin',
  },
  {
    id: 'django',
    name: '3. Django REST API',
    role: 'Application Server',
    tech: 'Django 6.1 + Gunicorn (Render)',
    status: 'idle',
    latency: '+38 ms',
    detail: 'Evaluates CORS regex, applies ScopedRateThrottle & dispatches async worker',
  },
  {
    id: 'ai_engine',
    name: '4. Vector & Microservice Engine',
    role: 'Inference & Retrieval',
    tech: 'FAISS / Sentence-Transformers',
    status: 'idle',
    latency: '+8 ms',
    detail: 'Generates 384-dim dense embeddings & retrieves top cosine similarity chunks',
  },
  {
    id: 'db',
    name: '5. Managed PostgreSQL',
    role: 'Data Persistence',
    tech: 'PostgreSQL 16 + pgvector',
    status: 'idle',
    latency: '+6 ms',
    detail: 'Stores contact messages, relational models & executes indexed queries',
  },
  {
    id: 'stream',
    name: '6. Streaming Response (SSE)',
    role: 'Token Dispatcher',
    tech: 'StreamingHttpResponse (text/event-stream)',
    status: 'idle',
    latency: '+12 ms',
    detail: 'Streams real-time tokens to client with zero-buffer Gunicorn yield',
  },
];

export function ArchitectureVisualizer() {
  const t = useTheme();
  const [hops, setHops] = useState<ArchitectureHop[]>(INITIAL_HOPS);
  const [isTracing, setIsTracing] = useState(false);
  const [currentHopIndex, setCurrentHopIndex] = useState(-1);
  const [totalLatency, setTotalLatency] = useState('78 ms');
  const screenWidth = Dimensions.get('window').width;
  const isMobile = screenWidth < 768;

  const runSimulation = () => {
    if (isTracing) return;
    setIsTracing(true);
    setCurrentHopIndex(0);

    setHops((prev) =>
      prev.map((h, i) => ({
        ...h,
        status: i === 0 ? 'active' : 'idle',
      }))
    );

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < INITIAL_HOPS.length) {
        setCurrentHopIndex(step);
        setHops((prev) =>
          prev.map((h, i) => ({
            ...h,
            status: i === step ? 'active' : i < step ? 'passed' : 'idle',
          }))
        );
      } else {
        clearInterval(interval);
        setHops((prev) =>
          prev.map((h) => ({
            ...h,
            status: 'passed',
          }))
        );
        setIsTracing(false);
        setCurrentHopIndex(-1);
      }
    }, 600);
  };

  const resetSimulation = () => {
    setIsTracing(false);
    setCurrentHopIndex(-1);
    setHops(INITIAL_HOPS);
  };

  return (
    <View
      style={{
        backgroundColor: t.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: t.border,
        padding: isMobile ? 14 : 20,
        marginVertical: 16,
      }}>
      {/* Header */}
      <View
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: t.border,
          paddingBottom: 14,
          marginBottom: 16,
        }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
            <Text style={{ color: t.text, fontSize: 16, fontWeight: '800' }}>
              Live Architecture Visualizer & Packet Tracer
            </Text>
            <View
              style={{
                backgroundColor: '#10b98122',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: '#10b981',
              }}>
              <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '800' }}>
                INTERACTIVE
              </Text>
            </View>
          </View>
          <Text style={{ color: t.muted, fontSize: 12, marginTop: 4 }}>
            Trace an end-to-end telemetry packet through Siva's production infrastructure.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable
            onPress={runSimulation}
            disabled={isTracing}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: isTracing ? '#334155' : t.accent,
              opacity: pressed ? 0.8 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            })}>
            <Text style={{ color: '#05070A', fontSize: 12, fontWeight: '800' }}>
              {isTracing ? 'Tracing Packet...' : '🚀 Simulate Packet Trace'}
            </Text>
          </Pressable>

          <Pressable
            onPress={resetSimulation}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: t.cardAlt,
              borderWidth: 1,
              borderColor: t.border,
            }}>
            <Text style={{ color: t.muted, fontSize: 12, fontWeight: '700' }}>Reset ↺</Text>
          </Pressable>
        </View>
      </View>

      {/* Network Hop Pipeline */}
      <View style={{ gap: 10 }}>
        {hops.map((hop, idx) => {
          const isActive = hop.status === 'active';
          const isPassed = hop.status === 'passed';

          return (
            <View
              key={hop.id}
              style={{
                backgroundColor: isActive
                  ? '#38bdf818'
                  : isPassed
                  ? '#10b98112'
                  : t.cardAlt,
                borderWidth: 1,
                borderColor: isActive
                  ? '#38bdf8'
                  : isPassed
                  ? '#10b98155'
                  : t.border,
                borderRadius: 12,
                padding: 12,
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: 8,
              }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      color: isActive ? '#38bdf8' : isPassed ? '#10b981' : t.text,
                      fontSize: 13,
                      fontWeight: '800',
                    }}>
                    {hop.name}
                  </Text>
                  <Text style={{ color: t.muted, fontSize: 11 }}>({hop.tech})</Text>
                </View>
                <Text style={{ color: t.muted, fontSize: 12, marginTop: 2 }}>
                  {hop.detail}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  alignSelf: isMobile ? 'flex-end' : 'center',
                }}>
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    backgroundColor: isActive ? '#38bdf833' : isPassed ? '#10b98133' : t.chip,
                  }}>
                  <Text
                    style={{
                      color: isActive ? '#38bdf8' : isPassed ? '#10b981' : t.chipText,
                      fontSize: 11,
                      fontWeight: '700',
                      fontFamily: Platform.OS === 'web' ? 'monospace' : 'SpaceMono',
                    }}>
                    {hop.latency}
                  </Text>
                </View>

                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: isActive
                      ? '#38bdf8'
                      : isPassed
                      ? '#10b981'
                      : '#64748b',
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Packet Telemetry Footer */}
      <View
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: t.border,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}>
        <Text style={{ color: t.muted, fontSize: 11 }}>
          Live Telemetry Protocol: <Text style={{ color: t.text, fontWeight: '700' }}>HTTP/2 SSE (Server-Sent Events)</Text>
        </Text>
        <Text style={{ color: t.muted, fontSize: 11 }}>
          Roundtrip Benchmark: <Text style={{ color: '#10b981', fontWeight: '800' }}>{totalLatency}</Text> (Cloudflare ➔ Render ➔ PostgreSQL)
        </Text>
      </View>
    </View>
  );
}
