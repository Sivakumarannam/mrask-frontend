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
import { openGmail, openLink } from '@/lib/links';

type RoleCategory = 'python' | 'devops' | 'network' | 'fullstack';

export function RecruiterCVStudio({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { theme: t, isDark } = useThemeContext();
  const [selectedRole, setSelectedRole] = useState<RoleCategory>('python');
  const [copied, setCopied] = useState(false);
  const isMobile = Dimensions.get('window').width < 768;

  if (!isOpen) return null;

  const roleConfigs: Record<
    RoleCategory,
    {
      title: string;
      pdfUrl: string;
      pdfFilename: string;
      summary: string;
      skillsList: string[];
    }
  > = {
    python: {
      title: 'Python Developer & Automation Engineer',
      pdfUrl: '/Siva_Kumar_Annam_Python_Developer.pdf',
      pdfFilename: 'Siva_Kumar_Annam_Python_Developer.pdf',
      summary:
        'Python Developer with 1.5+ years of hands-on experience building automation scripts, RESTful APIs, and data-processing tools for network monitoring and service assurance platforms at MasterCom Technology Services (Client: Tata Communications Ltd). Skilled in Python, Flask, Perl, Bash, and database migrations (MySQL → PostgreSQL) that reduced manual operational effort by 35%. Built on-premise RAG chatbots using LangChain and Ollama with verified reduction in hallucinations.',
      skillsList: [
        'Python (Strong), Flask, Django REST Framework, Perl, Bash, Shell Scripting',
        'Database Migrations (MySQL to PostgreSQL), SQL Join Optimization, DBeaver',
        'Generative AI: LangChain, Ollama (Qwen2.5/Llama3), RAG Pipelines, Vector Embeddings, FAISS',
        'APIs & Services: RESTful API Design, JSON Parameter Parsing, Caching & Performance Tuning',
        'Tooling & QA: Pytest, Git, Linux/Unix, ServiceNow, PuTTY, WinSCP',
      ],
    },
    devops: {
      title: 'DevOps & Cloud Engineer',
      pdfUrl: '/Siva_Kumar_Annam_DevOps_Cloud.pdf',
      pdfFilename: 'Siva_Kumar_Annam_DevOps_Cloud.pdf',
      summary:
        'DevOps and Cloud-oriented Engineer with 1.5+ years of experience in automation, infrastructure, and service assurance platforms. Hands-on with Python/Bash automation, AWS core services, Docker, Kubernetes, Terraform IaC, and CI/CD pipelines (GitHub Actions, Jenkins). Designed monitoring solutions that cut manual operational effort by ~30%, and delivered GitOps-style deployment workflows.',
      skillsList: [
        'Cloud: AWS (EC2, S3, RDS, VPC, IAM, Lambda, CloudWatch, Route 53, Auto Scaling, CodePipeline)',
        'Infrastructure as Code & Config: Terraform (Modules & Backends), Ansible, CloudFormation',
        'Containers & Orchestration: Docker, Kubernetes (ConfigMaps, Secrets, Resource Limits, Deployments)',
        'CI/CD & DevSecOps: GitHub Actions, Jenkins, GitLab CI/CD, Nexus, SonarQube, Slack Integration',
        'Observability: Prometheus, Grafana, Loki, CloudWatch, SevOne NMS',
      ],
    },
    network: {
      title: 'Network Automation & Service Assurance Engineer',
      pdfUrl: '/Siva_Kumar_Annam_Network_Automation.pdf',
      pdfFilename: 'Siva_Kumar_Annam_Network_Automation.pdf',
      summary:
        'Network Automation and Service Assurance Engineer with 1.5+ years of hands-on experience on SevOne NMS, DISHA (Assure1), and related monitoring platforms for Tata Communications Ltd. Expert in Python and Perl scripting for telemetry collection, reporting, device discovery, and operational tasks — delivering ~30–35% reduction in manual effort. Strong knowledge of SNMP, NetFlow, alert thresholds, and ServiceNow SLA compliance.',
      skillsList: [
        'Network Platforms: SevOne NMS, PMS, DISHA (Assure1), Spotlight Service Assurance',
        'Protocols & Telemetry: SNMP, NetFlow, Latency/Bandwidth/Packet Loss analysis, Alert Logs',
        'Automation & Scripting: Python, Perl, Bash, Shell scripts for device discovery and automated backups',
        'Data & APIs: MySQL, PostgreSQL CRUD, Join Rewrites, Flask RESTful APIs',
        'ITSM & Operations: Root Cause Analysis (RCA), ServiceNow (Incident/SR/CSR), SLA Compliance',
      ],
    },
    fullstack: {
      title: 'Full-Stack Developer & AI Systems Engineer (Master)',
      pdfUrl: '/Siva_Kumar_Annam_Python_Developer.pdf',
      pdfFilename: 'Siva_Kumar_Annam_Python_Developer.pdf',
      summary:
        'Full-Stack Developer and AI Systems Engineer with 1.5+ years at MasterCom Technology Services (Client: Tata Communications Ltd). Proficient across the entire stack: Python, Django, Flask, PostgreSQL, React Native (Expo) web & mobile interfaces, and self-hosted RAG LLM workflows with LangChain, Ollama, and FAISS vector indexing.',
      skillsList: [
        'Full-Stack Web & Mobile: React Native, Expo, TypeScript, Next.js, HTML5/CSS3 Glassmorphism',
        'Backend & Microservices: Python, Django, DRF, Flask, Celery, REST APIs, Rate Limiting',
        'Generative AI & LLMs: RAG Architectures, FAISS, Sentence-Transformers, Ollama, Prompt Engineering',
        'Cloud & Automation: AWS, Docker, Kubernetes, GitHub Actions CI/CD, SevOne NMS',
        'Databases & Systems: PostgreSQL, pgvector, MySQL migrations, Redis, Linux/Unix',
      ],
    },
  };

  const currentRole = roleConfigs[selectedRole];

  const copyPlaintextResume = () => {
    const text = `SIVA KUMAR ANNAM
${currentRole.title}
Phone: ${profile.phone} | Email: ${profile.email} | Location: ${profile.location}
LinkedIn: ${profile.linkedin} | GitHub: ${profile.github}

PROFESSIONAL SUMMARY:
${currentRole.summary}

WORK EXPERIENCE:
Associate Software Engineer | MasterCom Technology Services India Pvt Ltd, Bangalore
Client: Tata Communications Ltd (Pune) | Nov 2024 – Present (~1.5 years)
- Automated network management and reporting tasks via Python/Perl/Shell scripts (~35% manual effort reduction).
- Engineered Flask RESTful APIs with caching and query optimization, decreasing DB strain by 30%.
- Migrated production database workloads from MySQL to PostgreSQL, decreasing average join execution time by 2.5s.
- Correlated 5,000+ SNMP metrics and NetFlow flows on SevOne NMS, reducing incident detection time from 45 to 20 mins.
- Performed Root Cause Analysis (RCA) on Assure1 (DISHA) and Spotlight under strict ServiceNow SLAs.

CORE TECHNICAL SKILLS:
${currentRole.skillsList.map((s) => `- ${s}`).join('\n')}

FLAGSHIP PROJECTS:
1. SevOne NMS & Service Assurance Automation (Client: Tata Communications Ltd)
   Technologies: Python, Perl, Bash, Flask, MySQL, PostgreSQL, SevOne NMS, DISHA (Assure1), Linux, ServiceNow
2. RAG Document Intelligence Studio (LangChain + Ollama + FAISS)
   Technologies: Python, LangChain, Ollama (Qwen2.5), FAISS, Sentence-Transformers, PyPDF, SSE Streaming
3. Real-Time Weather Microservice & Multi-Platform App (Django REST Framework + Open-Meteo + Expo)
4. GitOps Continuous Deployment Platform (GitHub Actions + Kubernetes + Docker + Terraform)

EDUCATION & CREDENTIALS:
- B.Tech in Computer Science and Engineering | St. Mary’s Group of Institutions, Guntur, AP (2019 – 2023) | CGPA: 6.8
- Intermediate (+2) | NRI Junior College, Tenali, AP (2017 – 2019) | CGPA: 8.7
- SSC (Class 10) | Nehru Niketan High School, Tenali, AP | CGPA: 8.7
- Certification: Python Full Stack Development (2023)
- Certification: Full Stack Development Internship — Innomatics Research Labs (2023)`;

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

  const handleOpenOriginalPDF = () => {
    openLink(currentRole.pdfUrl);
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        zIndex: 999999,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? 8 : 20,
      }}>
      <View
        style={{
          width: isMobile ? '100%' : '92%',
          maxWidth: 960,
          height: isMobile ? '95%' : '90%',
          maxHeight: 840,
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
                <Text style={{ color: '#10b981', fontSize: 10, fontWeight: '800' }}>VERIFIED CV DATA</Text>
              </View>
            </View>
            <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 2 }}>
              Synchronized directly with Siva's verified resumes (MasterCom / Tata Communications Ltd).
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

        {/* 4 Role Selector Tabs */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: isDark ? '#111827' : '#f1f5f9',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#1f2937' : '#e2e8f0',
          }}>
          {[
            { id: 'python', label: '🐍 Python Developer' },
            { id: 'devops', label: '☁️ DevOps & Cloud' },
            { id: 'network', label: '🌐 Network Automation' },
            { id: 'fullstack', label: '🚀 Full-Stack AI Master' },
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
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 24, fontWeight: '900' }}>
                {profile.name}
              </Text>
              <Text style={{ color: '#38bdf8', fontSize: 15, fontWeight: '700', marginTop: 2 }}>
                {currentRole.title}
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 6, lineHeight: 18 }}>
                Phone: {profile.phone}  |  Email: {profile.email}  |  Location: {profile.location}
              </Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 2, lineHeight: 18 }}>
                LinkedIn: {profile.linkedin}  |  GitHub: {profile.github}
              </Text>
            </View>

            {/* Executive Summary */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                PROFESSIONAL SUMMARY
              </Text>
              <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 19, marginTop: 4 }}>
                {currentRole.summary}
              </Text>
            </View>

            {/* Verified Work Experience */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                VERIFIED WORK EXPERIENCE
              </Text>
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800' }}>
                    Associate Software Engineer | Automation & Platform Engineer
                  </Text>
                  <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '700' }}>
                    Nov 2024 – Present (~1.5 yrs)
                  </Text>
                </View>
                <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '700', marginTop: 1 }}>
                  MasterCom Technology Services India Pvt Ltd, Bangalore
                </Text>
                <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontStyle: 'italic', marginTop: 1 }}>
                  Project: SevOne NMS & Service Assurance Automation | Client: Tata Communications Ltd (Pune)
                </Text>

                <View style={{ marginTop: 6, gap: 4 }}>
                  <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                    • Automated network monitoring, reporting, and backups via Python, Perl & Shell scripts, achieving a <Text style={{ fontWeight: '700' }}>~35% reduction in manual effort</Text>.
                  </Text>
                  <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                    • Engineered Flask RESTful APIs with caching and query optimization, reducing database strain by <Text style={{ fontWeight: '700' }}>30%</Text>.
                  </Text>
                  <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                    • Migrated production workloads from MySQL to PostgreSQL, decreasing average join execution time by <Text style={{ fontWeight: '700' }}>2.5 seconds</Text>.
                  </Text>
                  <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                    • Correlated <Text style={{ fontWeight: '700' }}>5,000+ SNMP metrics and NetFlow flows</Text> on SevOne NMS, reducing incident detection time from 45 to 20 minutes.
                  </Text>
                  <Text style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                    • Diagnosed and resolved complex incidents across Assure1 (DISHA) and Spotlight platforms under strict ServiceNow SLA compliance.
                  </Text>
                </View>
              </View>
            </View>

            {/* Technical Proficiencies */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                ROLE COMPETENCIES & TECHNICAL STACK
              </Text>
              <View style={{ marginTop: 6, gap: 4 }}>
                {currentRole.skillsList.map((skill, sIdx) => (
                  <Text key={sIdx} style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 18 }}>
                    • {skill}
                  </Text>
                ))}
              </View>
            </View>

            {/* Key Highlighted Projects */}
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                FLAGSHIP PRODUCTION & ENGINEERING PROJECTS
              </Text>
              {projects.map((p) => (
                <View key={p.id} style={{ marginTop: 12 }}>
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
                </View>
              ))}
            </View>

            {/* Education & Certifications */}
            <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#e2e8f0', paddingTop: 12 }}>
              <Text style={{ color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 }}>
                EDUCATION & CERTIFICATIONS
              </Text>
              <View style={{ marginTop: 6, gap: 4 }}>
                {profile.education.map((edu, eIdx) => (
                  <Text key={eIdx} style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                    • <Text style={{ fontWeight: '700' }}>{edu.degree}</Text> — {edu.institution} ({edu.period}) | {edu.score}
                  </Text>
                ))}
                {profile.certifications.map((cert, cIdx) => (
                  <Text key={cIdx} style={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: 12, lineHeight: 17 }}>
                    • <Text style={{ fontWeight: '700' }}>Certification:</Text> {cert.name} ({cert.year})
                  </Text>
                ))}
              </View>
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
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: copied ? '#10b981' : isDark ? '#334155' : '#e2e8f0',
              opacity: pressed ? 0.8 : 1,
            })}>
            <Text style={{ color: copied ? '#ffffff' : isDark ? '#f8fafc' : '#0f172a', fontSize: 12, fontWeight: '700' }}>
              {copied ? '✓ Copied!' : '📋 Copy Plaintext ATS'}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleOpenOriginalPDF}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: '#10b981',
              opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>
              📥 Download Original PDF
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDownloadPDF}
            style={({ pressed }) => ({
              paddingHorizontal: 14,
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
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: '#6366f1',
              opacity: pressed ? 0.85 : 1,
            })}>
            <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '800' }}>
              ✉️ Connect
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
