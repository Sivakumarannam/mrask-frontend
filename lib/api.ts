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

export function sendMessage(payload: { name: string; email: string; message: string; website?: string }) {
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

export async function streamRagQuestion(
  file: File | Blob,
  question: string,
  onToken: (token: string) => void,
  onContext?: (chunks: string[]) => void
): Promise<void> {
  const form = new FormData();
  form.append('question', question);
  form.append('file', file);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3800);

  try {
    const res = await fetch(API_URL + '/api/rag/stream/', {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let detail = 'RAG stream request failed (' + res.status + ')';
      try {
        const data = await res.json();
        detail = data.detail ?? detail;
      } catch {}
      throw new Error(detail);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('Streaming is not supported by your browser.');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          try {
            const payload = JSON.parse(trimmed.replace(/^data:\s*/, ''));
            if (payload.type === 'token' && payload.token) {
              onToken(payload.token);
            } else if (payload.type === 'context' && payload.chunks && onContext) {
              onContext(payload.chunks);
            }
          } catch {}
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export type CopilotResponse = {
  answer: string;
  suggestions: string[];
  author: string;
  timestamp: string;
};

export async function askCopilot(message: string): Promise<CopilotResponse> {
  return request<CopilotResponse>('/api/copilot/chat/', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

export async function streamCopilot({
  message,
  onToken,
  onSuggestions,
}: {
  message: string;
  onToken: (token: string) => void;
  onSuggestions?: (suggestions: string[]) => void;
}): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(API_URL + '/api/copilot/stream/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      let detail = 'Copilot stream failed (' + res.status + ')';
      try {
        const data = await res.json();
        detail = data.detail ?? detail;
      } catch {}
      throw new Error(detail);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error('Streaming is not supported by your browser.');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          try {
            const payload = JSON.parse(trimmed.replace(/^data:\s*/, ''));
            if (payload.type === 'token' && payload.token) {
              onToken(payload.token);
            } else if (payload.suggestions && onSuggestions) {
              onSuggestions(payload.suggestions);
            }
          } catch {}
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
