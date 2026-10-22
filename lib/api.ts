import { projects as localProjects, type Project } from '@/data/projects';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  ''
);

async function request<T>(path: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(API_URL + path, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
      signal: controller.signal,
    });
    if (!res.ok) {
      let detail = 'Request failed (' + res.status + ')';
      try {
        const data = await res.json();
        detail = data.detail ?? JSON.stringify(data);
      } catch {
        // ignore body parse errors
      }
      throw new Error(detail);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

type ApiProject = {
  slug: string;
  title: string;
  tagline: string;
  role: string;
  summary: string;
  highlights: string[];
  stack: string[];
  steps: string[];
  github_url: string;
  demo_url: string;
  demo_kind: 'weather' | 'rag' | '';
};

/** Loads projects from Django/PostgreSQL. Falls back to local data if the API is offline. */
export async function getProjects(): Promise<{ projects: Project[]; source: 'api' | 'local' }> {
  try {
    const data = await request<ApiProject[]>('/api/projects/');
    if (!Array.isArray(data) || data.length === 0) {
      return { projects: localProjects, source: 'local' };
    }
    return {
      source: 'api',
      projects: data.map((p) => ({
        id: p.slug,
        title: p.title,
        tagline: p.tagline,
        role: p.role,
        summary: p.summary,
        highlights: p.highlights ?? [],
        stack: p.stack ?? [],
        steps: p.steps ?? [],
        github: p.github_url,
        demoUrl: p.demo_url || undefined,
        demoKind: p.demo_kind,
      })),
    };
  } catch {
    return { projects: localProjects, source: 'local' };
  }
}

export type Weather = {
  city: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  daily: { date: string; min: number; max: number; description: string; icon: string }[];
};

export function getWeather(city: string) {
  return request<Weather>('/api/weather/?city=' + encodeURIComponent(city));
}

export function sendMessage(payload: { name: string; email: string; message: string }) {
  return request<{ detail?: string; email_sent?: boolean; name?: string; email?: string; message?: string }>('/api/contact/', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 30000);
}

export type RagAnswer = {
  answer: string;
  file: string;
  chunks_used: string[];
  context_used?: string[];
  question: string;
};

export function askRagQuestion(file: File, question: string) {
  const form = new FormData();
  form.append('question', question);
  form.append('file', file);

  return fetch(API_URL + '/api/rag/ask/', {
    method: 'POST',
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      let detail = 'RAG request failed (' + res.status + ')';
      try {
        const data = await res.json();
        detail = data.detail ?? JSON.stringify(data);
      } catch {
        // ignore body parse errors
      }
      throw new Error(detail);
    }
    return (await res.json()) as RagAnswer;
  });
}
