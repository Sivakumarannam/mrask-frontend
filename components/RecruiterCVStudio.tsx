import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { useThemeContext } from '@/constants/theme';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import { openGmail } from '@/lib/links';

type RoleCategory = 'fullstack' | 'backend' | 'ai';

export function RecruiterCVStudio({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { theme: t, isDark } = useThemeContext();
  const [selectedRole, setSelectedRole] = useState<RoleCategory>('fullstack');
  const [copied, setCopied] = useState(false);
  const isMobile = Dimensions.get('window').width < 768;

  if (!isOpen) return null;

  const roleSummaries: Record<RoleCategory, { title: string; summary: string }> = {
    fullstack: {
      title: 'Full-Stack Developer (Python / Django & React Native)',
      summary:
        'Versatile Full-Stack Engineer with 3+ years of hands-on expertise building production-ready web and mobile applications. Proven track record architecting high-throughput Django REST APIs, PostgreSQL databases, and reactive TypeScript/React Native frontends with seamless UX.',
    },
    backend: {
      title: 'Backend Systems Engineer (Python / Django / Microservices)',
      summary:
        'Backend specialist experienced in developing scalable microservices, resilient relational schemas, asynchronous job pipelines, and secure RESTful architectures using Python, Django, DRF, Celery, and Docker with comprehensive automated test coverage.',
    },
    ai: {
      title: 'AI Systems & RAG Engineer (Ollama / FAISS / LLMs)',
      summary:
        'AI practitioner focused on grounded Retrieval-Augmented Generation (RAG) architectures, on-premise LLM inference with Ollama (Qwen2.5/Llama3), vector similarity indexing via FAISS and Sentence-Transformers, and streaming knowledge-base microservices.',
    },
  };

  const currentRole = roleSummaries[selectedRole];

  const copyPlaintextResume = () => {
    const text = `SIVA KUMAR ANNAM
Full-Stack Developer & AI Systems Engineer
Location: ${profile.location} | Email: ${profile.email} | GitHub: ${profile.github}
Availability: ${profile.openTo}

SUMMARY:
${currentRole.summary}

CORE SKILLS:
- Languages: Python, JavaScript, TypeScript, SQL, HTML5, CSS3
- Frameworks & Libs: Django, Django REST Framework, FastAPI, React Native, Expo, Next.js
- AI & Vector Intelligence: Ollama (Qwen/Llama), FAISS, Sentence-Transformers, PyPDF, RAG Architecture
- Database & Storage: PostgreSQL, SQLite, Redis
- Cloud, DevOps & Tools: Docker, Gunicorn, Vercel, Render, Git/GitHub, CI/CD, WhiteNoise

SELECTED PRODUCTION PROJECTS:
1. Retrieval-Augmented Generation (RAG) Document Studio
   - Self-hosted document Q&A pipeline with local vector embeddings (Sentence-Transformers) and FAISS.
   - Real-time Server-Sent Events (SSE) streaming tokens to web/mobile clients.
2. Real-Time Weather Microservice
   - Django REST Framework backend with geocoding normalization, Open-Meteo caching, and rate limiting.
   - Multi-platform responsive client built with Expo and cross-platform UI tokens.

EDUCATION:
- Bachelor's in Computer Science / Engineering (2020 - 2024)`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.82)',
        zIndex: 999999,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? 8 : 20,
      }}>
      <View
        style={{
          width: isMobile ? '100%' : '90%',
          maxWidth: 920,
          height: isMobile ? '94%' : '88%',
          maxHeight: 820,
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: isDark ? '#1e293b' : '#e2e8f0',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 28,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
        {/* Studio Header Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#334155' : '#e2e8f0',
          }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 18 }}>📋</Text>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 16, fontWeight: '800' }}>
                Recruiter CV Studio & ATS Generator
              </Text>
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 999,
                  backgroundColor: '#10b98122',
                  borderWidth: 1,
                  borderColor: '#10b981',
                }}>
                <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '800' }}>ATS-VERIFIED</Text>
              </View>
            </View>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 2 }}>
              Tailor Siva's resume to match your hiring profile and generate a clean ATS copy.
            </Text>
          </View>

          <Pressable
            onPress={onClose}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: isDark ? '#334155' : '#e2e8f0',
            }}>
            <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '700', fontSize: 12 }}>
              Close ✕
            </Text>
          </Pressable>
        </View>

        {/* Role Selector Tabs */}
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: isDark ? '#111827' : '#f1f5f9',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1f2937' : '#e2e8f0',
          }}>
          {[
            { id: 'fullstack', label: '🚀 Full-Stack' },
            { id: 'backend', label: '⚙️ Backend Systems' },
            { id: 'ai', label: '🧠 AI & RAG' },
          ].map((r) => {
            const active = selectedRole === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => setSelectedRole(r.id as RoleCategory)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 8,
                  backgroundColor: active
                    ? '#38bdf8'
                    : isDark
                    ? '#1e293b'
                    : '#e2e8f0',
                }}>
                <Text
                  style={{
                    color: active ? '#0f172a' : isDark ? '#94a3b8' : '#475569',
                    fontSize: 12,
                    fontWeight: active ? '800' : '600',
                  }}>
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Printable ATS Resume Preview */}
        <ScrollView style={{ flex: 1, padding: 20 }} contentContainerStyle={{ paddingBottom: 24 }}>
          <View
            style={{
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              padding: 24,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: isDark ? '#334155' : '#cbd5e1',
            }}>
            {/* Candidate Header */}
            <View style={{ borderBottomWidth: 2, borderBottomColor: '#38bdf8', paddingBottom: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 22, fontWeight: '900' }}>
                SIVA KUMAR ANNAM
              </Text>
              <Text style={{ color: '#38bdf8', fontSize: 14, fontWeight: '700', marginTop: 2 }}>
                {currentRole.title}
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 6, lineHeight: 18 }}>
                Location: {profile.location}  |  Email: {profile.email}  |  GitHub: {profile.github}
              </Text>
            </View>

            {/* Executive Summary */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                EXECUTIVE SUMMARY
              </Text>
              <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                {currentRole.summary}
              </Text>
            </View>

            {/* Technical Proficiencies */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                CORE COMPETENCIES & TECHNICAL STACK
              </Text>
              <View style={{ marginTop: 6, gap: 4 }}>
                <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                  • <Text style={{ fontWeight: '700' }}>Backend Architecture:</Text> Python, Django, DRF, FastAPI, REST APIs, Celery, Authentication & RBAC
                </Text>
                <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                  • <Text style={{ fontWeight: '700' }}>Frontend & Cross-Platform:</Text> React Native, Expo, TypeScript, Next.js, Responsive Glassmorphism
                </Text>
                <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                  • <Text style={{ fontWeight: '700' }}>AI & Retrieval-Augmented Gen:</Text> Ollama, FAISS Vector Search, Sentence-Transformers, Chunking, Streaming SSE
                </Text>
                <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                  • <Text style={{ fontWeight: '700' }}>Database & Cloud DevOps:</Text> PostgreSQL, SQLite, Redis, Docker, Gunicorn, Vercel, Render, CI/CD
                </Text>
              </View>
            </View>

            {/* Key Highlighted Projects */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                KEY PRODUCTION ENGINEERING PROJECTS
              </Text>
              {projects.map((p) => (
                <View key={p.id} style={{ marginTop: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '700' }}>
                      {p.title}
                    </Text>
                    <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '700' }}>
                      {p.role}
                    </Text>
                  </View>
                  <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontStyle: 'italic', marginTop: 1 }}>
                    Stack: {p.stack.join(' • ')}
                  </Text>
                  <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17, marginTop: 4 }}>
                    {p.summary}
                  </Text>
                  {p.highlights?.slice(0, 2).map((h, hIdx) => (
                    <Text key={hIdx} style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 11, lineHeight: 16, marginTop: 2, paddingLeft: 8 }}>
                      - {h}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            {/* Education */}
            <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#e2e8f0', paddingTop: 12 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                EDUCATION & CREDENTIALS
              </Text>
              <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, marginTop: 4 }}>
                Bachelor of Technology in Computer Science & Engineering (B.Tech)
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Toolbar */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
            borderTopWidth: 1,
            borderTopColor: isDark ? '#334155' : '#e2e8f0',
          }}>
          <Pressable
            onPress={copyPlaintextResume}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: copied ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
              opacity: pressed ? 0.8 : 1,
            })}>
            <Text style={{ color: copied ? '#ffffff' : isDark ? '#f8fafc' : '#0f172a', fontSize: 12, fontWeight: '700' }}>
              {copied ? '✓ Copied to Clipboard!' : '📋 Copy Plaintext ATS Resume'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDownloadPDF}
            style={({ pressed }) => ({
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: '#38bdf8',
              opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ color: '#0f172a', fontSize: 12, fontWeight: '800' }}>
              🖨️ Print / Save ATS PDF
            </Text>
          </Pressable>

          <Pressable
            onPress={() => openGmail()}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: '#10b981',
              opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>
              ✉️ Connect with Siva
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
