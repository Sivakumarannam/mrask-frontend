// Master project data synchronized directly with Siva's verified resumes.
// Includes enterprise production work (Tata Communications) and flagship AI/DevOps systems.

export type Project = {
  id: string;
  title: string;
  tagline: string;
  role: string;
  summary: string;
  highlights: string[];
  stack: string[];
  steps: string[];
  github: string;
  demoUrl?: string;
  demoKind?: 'weather' | 'rag' | '';
};

export const projects: Project[] = [
  {
    id: 'sevone-automation',
    title: 'SevOne NMS & Service Assurance Automation',
    tagline: 'Enterprise network monitoring & operational automation for telecom',
    role: 'Associate Software Engineer (MasterCom / Client: Tata Communications Ltd)',
    summary:
      'End-to-end automation of monitoring, reporting, and operational tasks on SevOne NMS, PMS, and DISHA (Assure1) for Tata Communications Ltd. Built Python and Perl automations that reduced manual operational effort by 35%, engineered Flask REST APIs with caching, and led database migration from MySQL to PostgreSQL optimizing query execution by 2.5 seconds.',
    highlights: [
      'Automated device discovery, backups, log cleanup, and metrics collection via Python, Perl & Shell scripts (cut effort by ~35%)',
      'Correlated 5,000+ SNMP metrics and NetFlow flows on SevOne dashboards, reducing incident detection time from 45 to 20 minutes',
      'Successfully migrated production database workloads from MySQL to PostgreSQL with join rewrites via Python/Perl and DBeaver',
      'Engineered Flask RESTful APIs with caching and performance optimization, reducing database strain by 30%',
      'Provided L2/L3 support on Assure1 & Spotlight for real-time monitoring, incident troubleshooting, and RCA under strict SLAs in ServiceNow',
    ],
    stack: ['Python', 'Perl', 'Bash', 'Flask', 'MySQL', 'PostgreSQL', 'SevOne NMS', 'DISHA (Assure1)', 'SNMP', 'NetFlow', 'Linux', 'ServiceNow'],
    steps: [
      'Ingest SNMP & NetFlow telemetry',
      'Correlate 5,000+ metrics in SevOne NMS',
      'Trigger threshold alerts & incident logs',
      'Automated Python/Perl scripts execute discovery/cleanup',
      'Flask REST API serves analytics dashboards',
      'Sync tickets & SLA tracking via ServiceNow',
    ],
    github: 'https://github.com/Sivakumarannam',
    demoKind: '',
  },
  {
    id: 'rag-chatbot',
    title: 'RAG Document Intelligence Studio',
    tagline: 'Chat with custom PDF/Text documents using local LLMs & FAISS vector search',
    role: 'Generative AI & LLM Project',
    summary:
      'An end-to-end Retrieval-Augmented Generation (RAG) system built with LangChain, local Ollama LLMs (Qwen2.5/Llama3), Sentence-Transformers, and FAISS vector indexing. Enables multi-turn context-aware Q&A on custom knowledge bases with streaming SSE tokens and grounded source citations.',
    highlights: [
      'Ingests PDF and text documents, splits text into overlapping semantic chunks, and creates 384-dimensional dense embeddings',
      'Performs real-time sub-millisecond vector similarity search using FAISS (IndexFlatIP / Cosine Similarity)',
      'Streams LLM tokens in real-time to web and mobile clients via Server-Sent Events (SSE)',
      'Displays grounded citations highlighting exact source paragraphs to prevent hallucinations',
      'Self-hosted on-premise pipeline running with local Ollama, eliminating third-party cloud API costs',
    ],
    stack: ['Python', 'LangChain', 'FAISS', 'Ollama', 'Qwen2.5', 'Sentence-Transformers', 'PyPDF', 'Django', 'React Native'],
    steps: [
      'Upload PDF or text document',
      'Extract text via PyPDF reader',
      'Split into overlapping semantic chunks',
      'Generate embeddings with Sentence-Transformers',
      'Index vectors into FAISS store',
      'Cosine similarity retrieves top citations',
      'LLM streams grounded answer via SSE',
    ],
    github: 'https://github.com/Sivakumarannam/rag-chatbot-langchain-ollama',
    demoKind: 'rag',
  },
  {
    id: 'weather-app',
    title: 'Real-Time Weather Microservice',
    tagline: 'Geocoding resolver & meteorological forecast microservice',
    role: 'Full-Stack Microservice',
    summary:
      'A resilient weather microservice powered by Django REST Framework on Render and a cross-platform Expo client. Resolves geographic coordinates via Open-Meteo geocoding, aggregates 5-day forecasts, implements scoped rate limiting, and caches responses for high availability.',
    highlights: [
      'Fetches current weather, apparent temperature, humidity, wind speed, and 5-day daily forecast for any global city',
      'Django REST Framework backend normalizes weather WMO codes into intuitive emojis and human-readable descriptions',
      'Includes scoped throttling (30 req/min) to prevent abuse and protect downstream APIs',
      'Seamless cross-platform UI built with custom glassmorphism design tokens running on Web, Android, and iOS',
    ],
    stack: ['Python', 'Django', 'Django REST Framework', 'REST API', 'Open-Meteo', 'React Native', 'Expo'],
    steps: [
      'User queries city name',
      'Django API checks cache & rate limits',
      'Geocoding API resolves latitude & longitude',
      'Open-Meteo retrieves hourly & daily forecast',
      'Backend formats and serializes response JSON',
      'Client renders interactive 5-day forecast card',
    ],
    github: 'https://github.com/Sivakumarannam/weather_API_Backup',
    demoKind: 'weather',
  },
  {
    id: 'gitops-platform',
    title: 'GitOps Continuous Deployment Platform',
    tagline: 'Automated declarative delivery using GitHub Actions & Kubernetes',
    role: 'Cloud & DevOps Capstone',
    summary:
      'An end-to-end GitOps deployment pipeline utilizing GitHub Actions, Docker containerization, and Kubernetes manifests for declarative continuous delivery. Automates pipeline execution, container image builds, SonarQube code scanning, and environment promotion.',
    highlights: [
      'Configured automated CI/CD workflows using GitHub Actions and Jenkins with Slack notifications',
      'Integrated SonarQube for static code quality analysis and Nexus for artifact management',
      'Managed Kubernetes deployments, services, ConfigMaps, Secrets, and resource limits',
      'Implemented Infrastructure as Code (IaC) patterns using Terraform for repeatable cloud provisioning',
    ],
    stack: ['Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins', 'Terraform', 'AWS', 'SonarQube', 'Linux'],
    steps: [
      'Code push triggers GitHub Actions workflow',
      'Linting & unit tests run in parallel runner',
      'SonarQube validates code quality & security',
      'Docker container image built and tagged',
      'Pushed to container registry',
      'Kubernetes applies declarative manifest updates',
    ],
    github: 'https://github.com/Sivakumarannam',
    demoKind: '',
  },
];
