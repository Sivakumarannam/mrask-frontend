// Master project data synchronized directly with Siva's verified resumes.
// Includes enterprise production work (Tata Communications) and flagship AI/DevOps systems.

export type ProjectImage = {
  url: string;
  caption: string;
  technicalDetails: string;
};

export type ProjectArchitecture = {
  description: string;
  flow: string[];
  metrics: { label: string; value: string }[];
};

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
  images: [ProjectImage, ProjectImage];
  architecture: ProjectArchitecture;
};

export const projects: Project[] = [
  {
    id: 'sevone-automation',
    title: 'SevOne NMS & Service Assurance Automation',
    tagline: 'Enterprise network monitoring & operational automation for telecom',
    role: 'Associate Software Engineer (MasterCom / Client: Tata Communications Ltd)',
    summary:
      'End-to-end automation of monitoring, reporting, and operational tasks on SevOne NMS, PMS, and DISHA (Assure1) for Tata Communications Ltd. Built Python and Perl automations that reduced manual operational effort by 35%, engineered Python REST APIs with caching, and led database migration from MySQL to PostgreSQL optimizing query execution by 2.5 seconds.',
    highlights: [
      'Automated device discovery, backups, log cleanup, and metrics collection via Python, Perl & Shell scripts (cut effort by ~35%)',
      'Correlated 5,000+ SNMP metrics and NetFlow flows on SevOne dashboards, reducing incident detection time from 45 to 20 minutes',
      'Successfully migrated production database workloads from MySQL to PostgreSQL with join rewrites via Python/Perl and DBeaver',
      'Engineered Python RESTful APIs with caching and performance optimization, reducing database strain by 30%',
      'Provided L2/L3 support on Assure1 & Spotlight for real-time monitoring, incident troubleshooting, and RCA under strict SLAs in ServiceNow',
    ],
    stack: ['Python', 'Perl', 'Bash', 'Django REST Framework', 'MySQL', 'PostgreSQL', 'SevOne NMS', 'DISHA (Assure1)', 'SNMP', 'NetFlow', 'Linux', 'ServiceNow'],
    steps: [
      'Ingest SNMP & NetFlow telemetry',
      'Correlate 5,000+ metrics in SevOne NMS',
      'Trigger threshold alerts & incident logs',
      'Automated Python/Perl scripts execute discovery/cleanup',
      'Python REST API serves analytics dashboards',
      'Sync tickets & SLA tracking via ServiceNow',
    ],
    github: 'https://github.com/Sivakumarannam',
    demoKind: '',
    images: [
      {
        url: '/images/projects/sevone_1.jpg',
        caption: 'SevOne NMS Production Telemetry & NOC Dashboard',
        technicalDetails:
          'Live ingestion and correlation of 5,000+ SNMP OIDs and NetFlow telemetry streams across core routers and carrier circuits, alerting on packet loss and latency spikes.',
      },
      {
        url: '/images/projects/sevone_2.jpg',
        caption: 'Automated Incident Remediation & ServiceNow SLA Flow',
        technicalDetails:
          'Event-driven Python daemon listens to threshold breaches, executes automated diagnostic checks, triggers disk/cache cleanup, and auto-generates SLA-tracked ServiceNow incident tickets.',
      },
    ],
    architecture: {
      description:
        'A high-reliability telecom telemetry pipeline. Core network devices broadcast SNMP traps and IPFIX/NetFlow telemetry into SevOne and Assure1. Python automation daemons poll SevOne REST APIs, run threshold-based health heuristics, perform automated remediation commands via SSH, and push structured RCA logs into ServiceNow for L2/L3 NOC teams.',
      flow: [
        'Routers/Switches ➔ SNMP & NetFlow Polling (5,000+ streams)',
        'SevOne NMS & Assure1 ➔ Correlation & Threshold Breach Alerting',
        'Python Event Listener ➔ Validates Incident Severity & State',
        'Automation Engine ➔ Runs Diagnostic Runbook / Log Rotation via SSH',
        'ServiceNow API ➔ Dispatches P1/P2 Ticket with RCA Telemetry',
      ],
      metrics: [
        { label: 'Operational Effort Cut', value: '35%' },
        { label: 'Incident Detection Time', value: '45m ➔ 20m' },
        { label: 'Correlated Metrics', value: '5,000+' },
        { label: 'SLA Adherence', value: '99.8%' },
      ],
    },
  },
  {
    id: 'telecom-db-migration',
    title: 'MySQL → PostgreSQL Telecom Database Migration',
    tagline: 'High-throughput database migration, join optimization & Python API caching',
    role: 'Associate Software Engineer (MasterCom / Client: Tata Communications Ltd)',
    summary:
      'Engineered and executed mission-critical database migration from legacy MySQL to PostgreSQL for Tata Communications telecom infrastructure. Rewrote complex joins using Python and Perl hashes, optimized query execution times by 2.5 seconds, and designed Python RESTful APIs with caching that cut database strain by 30%.',
    highlights: [
      'Successfully migrated large-scale relational schemas from MySQL to PostgreSQL with zero downtime or data loss',
      'Optimized multi-table join logic and query structures, cutting average query execution time by 2.5s',
      'Engineered Python RESTful APIs with caching and parameter validation, reducing database load by 30%',
      'Authored automated Python and Perl validation scripts verifying data integrity across all migrated tables',
    ],
    stack: ['Python', 'Perl', 'PostgreSQL', 'MySQL', 'SQL', 'DBeaver', 'Linux'],
    steps: [
      'Schema analysis & data type mapping',
      'Python/Perl automated extraction scripts',
      'PostgreSQL schema creation & indexing',
      'Complex join rewrites & benchmark testing',
      'API caching layer implementation',
      'Cutover validation & SLA signoff',
    ],
    github: 'https://github.com/Sivakumarannam',
    demoKind: '',
    images: [
      {
        url: '/images/projects/telecom_db_1.jpg',
        caption: 'Schema Mapping & DBeaver Dual-Engine Validation Studio',
        technicalDetails:
          'Dual database console running automated Python verification jobs comparing row counts, checksum hashes, and foreign key constraints across MySQL and PostgreSQL schemas.',
      },
      {
        url: '/images/projects/telecom_db_2.jpg',
        caption: 'Query Latency Optimization & Index Benchmarking',
        technicalDetails:
          'EXPLAIN ANALYZE comparison showing multi-table join execution time slashed from 3.2 seconds to 0.4 seconds utilizing PostgreSQL compound B-Tree indexes and Python in-memory caching.',
      },
    ],
    architecture: {
      description:
        'Zero-downtime database modernization pipeline. Legacy MySQL instances were systematically analyzed, data types mapped to strict PostgreSQL equivalents, and data migrated in chunks via high-throughput Python/Perl ETL scripts. Custom query rewrites replaced nested MySQL subqueries with PostgreSQL CTEs and window functions.',
      flow: [
        'MySQL Source ➔ Read Replica Chunk Extraction via Python',
        'Transform Engine ➔ Data Type Casts & Timestamp Normalization',
        'PostgreSQL Target ➔ Bulk Ingestion with Disabled Index Mode',
        'Optimization Phase ➔ B-Tree Index Rebuild & CTE Query Rewriting',
        'Verification Suite ➔ Row Hash & Checksum Automated Validation',
      ],
      metrics: [
        { label: 'Query Latency Drop', value: '3.2s ➔ 0.4s' },
        { label: 'Database Strain Reduction', value: '30%' },
        { label: 'Data Loss Rate', value: '0.00%' },
        { label: 'Downtime During Cutover', value: '0 minutes' },
      ],
    },
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
    images: [
      {
        url: '/images/projects/rag_1.jpg',
        caption: 'Split-Screen Document Intelligence & Real-Time Chat Studio',
        technicalDetails:
          'Interactive workspace displaying document preview with highlighted grounded citations side-by-side with an LLM token streaming terminal.',
      },
      {
        url: '/images/projects/rag_2.jpg',
        caption: 'Dense Vector Pipeline & FAISS Similarity Search Engine',
        technicalDetails:
          '384-dimensional vector embedding space visualizer demonstrating cosine similarity clustering and top-K semantic document passage retrieval in under 4ms.',
      },
    ],
    architecture: {
      description:
        'A local-first Generative AI pipeline. Documents are parsed into 500-token chunks with 50-token overlap, transformed into 384-dimensional dense vectors using Sentence-Transformers (all-MiniLM-L6-v2), and stored in an in-memory FAISS vector index. User queries are embedded on the fly, matched against top-k similar chunks, and synthesized by Ollama Qwen2.5 with citation grounding.',
      flow: [
        'Document Ingestion ➔ PyPDF extracts text & structural metadata',
        'Semantic Chunking ➔ Overlapping chunks (500 tokens, 50 overlap)',
        'Vector Embedding ➔ Sentence-Transformers generates 384-d vectors',
        'FAISS Index ➔ Sub-millisecond Cosine Similarity top-3 retrieval',
        'Ollama LLM ➔ Augmented prompt synthesized with SSE token streaming',
      ],
      metrics: [
        { label: 'Retrieval Latency', value: '< 4ms' },
        { label: 'Embedding Dimensions', value: '384-dim' },
        { label: 'Cloud API Cost', value: '$0 (Self-Hosted)' },
        { label: 'Citation Grounding', value: '100% Verifiable' },
      ],
    },
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
    images: [
      {
        url: '/images/projects/weather_1.jpg',
        caption: 'Glassmorphic 5-Day Weather & Meteorological Forecast Studio',
        technicalDetails:
          'Dark-mode glassmorphic interface showing live temperature, humidity, wind speed, pressure, and hourly forecast telemetry.',
      },
      {
        url: '/images/projects/weather_2.jpg',
        caption: 'Django REST Microservice Architecture & Geocoding Pipeline',
        technicalDetails:
          'High-availability Django REST API handling geocoding name resolution, rate limiting (30 req/min), in-memory caching, and Open-Meteo payload normalization.',
      },
    ],
    architecture: {
      description:
        'A microservice architecture decoupling client interfaces from meteorological data providers. Django REST Framework serves as an intelligent proxy layer that resolves geographic city queries to latitude/longitude coordinates, caches forecast responses in memory, applies client rate-limiting, and normalizes international WMO codes.',
      flow: [
        'Client Query ➔ Sends city name or coordinates to Django API',
        'Rate Limiting & Cache ➔ Enforces 30 req/min limit & checks cache hit',
        'Geocoding Resolver ➔ Converts city name to exact Lat/Lon coordinates',
        'Open-Meteo Upstream ➔ Requests current metrics & 5-day hourly forecast',
        'Serializer & Formatter ➔ Normalizes WMO codes & delivers JSON payload',
      ],
      metrics: [
        { label: 'API Response Time', value: '< 180ms' },
        { label: 'Cache Hit Rate', value: '78%' },
        { label: 'Rate Limiting', value: '30 req/min' },
        { label: 'Global Coverage', value: '100% Worldwide' },
      ],
    },
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
    images: [
      {
        url: '/images/projects/gitops_1.jpg',
        caption: 'GitHub Actions Multi-Stage CI/CD Pipeline Dashboard',
        technicalDetails:
          'Automated pipeline visualization showing parallel test runs, SonarQube code quality gates, container image builds, and automated Docker registry publishing.',
      },
      {
        url: '/images/projects/gitops_2.jpg',
        caption: 'Kubernetes Production Cluster Topology & Ingress Architecture',
        technicalDetails:
          'Declarative Kubernetes infrastructure diagram with NGINX Ingress Controller, Pod auto-scaling, ConfigMaps, Secrets, and Terraform AWS cloud provisioning.',
      },
    ],
    architecture: {
      description:
        'A declarative GitOps delivery engine. Every git commit triggers an automated GitHub Actions runner that executes linting, unit testing, and SonarQube security scanning. Upon passing, a multi-stage Docker container is built, scanned for CVE vulnerabilities, tagged with the git commit SHA, and pushed to AWS ECR. Kubernetes cluster manifests are reconciled declaratively.',
      flow: [
        'Developer Commit ➔ Pushed to GitHub repository main branch',
        'CI Runner ➔ Parallel test suite & SonarQube quality gate execution',
        'Docker Multi-Stage Build ➔ Minimal image tagged with Git SHA',
        'Artifact Registry ➔ Immutable image stored in container registry',
        'Kubernetes CD ➔ Manifest rollout with zero-downtime rolling update',
      ],
      metrics: [
        { label: 'Deployment Lead Time', value: '< 6 minutes' },
        { label: 'Code Quality Gate', value: '100% Passed' },
        { label: 'Deployment Downtime', value: '0 seconds' },
        { label: 'Infrastructure Repeatability', value: '100% Terraform' },
      ],
    },
  },
];
