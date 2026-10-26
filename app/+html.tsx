import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

const structuredData = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': 'https://mrask-frontend.vercel.app/#person',
      name: 'Siva Kumar Annam',
      alternateName: 'Mr.A.S.K',
      jobTitle: 'Full-Stack Developer & AI Systems Engineer',
      description:
        'Full-Stack Developer and AI Systems Engineer specializing in Python, Django REST Framework, React Native, Expo, and on-premise RAG vector architectures.',
      url: 'https://mrask-frontend.vercel.app',
      sameAs: [
        'https://github.com/Sivakumarannam',
        'https://linkedin.com/in/siva-kumar-annam',
      ],
      knowsAbout: [
        'Python',
        'Django',
        'FastAPI',
        'React Native',
        'Expo',
        'Retrieval-Augmented Generation (RAG)',
        'FAISS',
        'PostgreSQL',
        'Docker',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://mrask-frontend.vercel.app/#website',
      url: 'https://mrask-frontend.vercel.app',
      name: 'Siva Kumar Annam (Mr.A.S.K) Portfolio',
      description: 'Production portfolio featuring full-stack applications, live weather APIs, and RAG AI studios.',
      publisher: {
        '@id': 'https://mrask-frontend.vercel.app/#person',
      },
    },
  ],
});

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Primary Meta Tags */}
        <title>Siva Kumar Annam (Mr.A.S.K) | Full-Stack & AI Systems Engineer</title>
        <meta
          name="description"
          content="Production engineering portfolio of Siva Kumar Annam (Mr.A.S.K). Featuring self-hosted RAG LLM architectures, real-time Django microservices, and cross-platform React Native Expo apps."
        />
        <meta
          name="keywords"
          content="Siva Kumar Annam, Mr.A.S.K, Full-Stack Developer, Python Developer, Django Engineer, React Native, Expo, RAG Chatbot, AI Engineer, FAISS, Ollama, Portfolio"
        />
        <meta name="author" content="Siva Kumar Annam" />
        <meta name="theme-color" content="#0B0F19" />

        {/* OpenGraph / Facebook / LinkedIn / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mrask-frontend.vercel.app/" />
        <meta property="og:site_name" content="Mr.A.S.K Portfolio" />
        <meta property="og:title" content="Siva Kumar Annam (Mr.A.S.K) | Full-Stack & AI Systems Engineer" />
        <meta
          property="og:description"
          content="Explore production web apps, Django & FastAPI backend services, RAG AI document intelligence, and cross-platform mobile solutions."
        />
        <meta property="og:image" content="https://mrask-frontend.vercel.app/profile-photo.0fb2fb9a00e099716e9102c917997f7f.png" />
        <meta property="og:image:alt" content="Siva Kumar Annam Profile Avatar" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mrask-frontend.vercel.app/" />
        <meta name="twitter:title" content="Siva Kumar Annam (Mr.A.S.K) | Full-Stack & AI Systems Engineer" />
        <meta
          name="twitter:description"
          content="Full-Stack Engineer building scalable web apps, real-time RAG AI systems, and cloud microservices."
        />
        <meta name="twitter:image" content="https://mrask-frontend.vercel.app/profile-photo.0fb2fb9a00e099716e9102c917997f7f.png" />

        {/* PWA Manifest & Mobile Standalone Tags */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mr.A.S.K" />

        {/* JSON-LD Structured Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData }}
        />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration error:', err);
                  });
                });
              }
            `,
          }}
        />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #0b0f19;
}
@media (prefers-color-scheme: light) {
  body {
    background-color: #f8fafc;
  }
}`;
