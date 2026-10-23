# Production Deployment Post-Mortem, Issue Log & Engineering Runbook

**Author:** Siva Kumar Annam (Mr.A.S.K)  
**Project:** Portfolio Expo & Mr.A.S.K Backend  
**Deployment Platforms:** Vercel (Frontend) & Render (Backend + PostgreSQL)  
**Last Updated:** October 2026  
**Status:** 100% Production Operational & Fully Hardened  

---

## 1. Executive Summary & Live Production Architecture

The application has been separated into two clean, decoupled cloud repositories and deployed live:

| Component | Repository | Platform | Production URL |
| :--- | :--- | :--- | :--- |
| **Frontend** | [mrask-frontend](https://github.com/Sivakumarannam/mrask-frontend.git) | Vercel | [https://mrask-frontend.vercel.app](https://mrask-frontend.vercel.app) |
| **Backend API** | [mrask-backend](https://github.com/Sivakumarannam/mrask-backend.git) | Render | [https://mrask.onrender.com](https://mrask.onrender.com) |
| **Database** | Managed PostgreSQL | Render Cloud | Internal Connection via `DATABASE_URL` |
| **Frontend CI/CD**| GitHub Actions | Ubuntu Runner | `.github/workflows/ci.yml` (Passing ✅) |
| **Backend CI/CD** | GitHub Actions | Ubuntu Runner | `.github/workflows/backend-ci.yml` (Passing ✅) |

```
┌────────────────────────────────────────────────────────┐
│  FRONTEND (Vercel): mrask-frontend.vercel.app          │
│  • Expo SDK 57 + React Native Web                      │
│  • Pre-rendered static pages + SPA fallback            │
│  • Light / Dark theme with persistent localStorage     │
│  • Real-time SSE streaming client + In-Browser PDF UI  │
└────────────────────────────────────────────────────────┘
                           │
                  HTTPS API Requests / SSE
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  BACKEND (Render): mrask.onrender.com                  │
│  • Django 6.1 + Django REST Framework + Gunicorn       │
│  • WhiteNoise static asset serving                     │
│  • Live Open-Meteo Weather endpoint (/api/weather/)    │
│  • Streaming RAG AI endpoint (/api/rag/stream/)        │
│  • Asynchronous Background Email Thread (<170ms)       │
│  • Health check (/api/health/) & Schema (/api/docs/)   │
└────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  DATABASE (Render Managed PostgreSQL):                 │
│  • pgvector vector similarity store                    │
│  • Projects & Contact messages persistence             │
└────────────────────────────────────────────────────────┘
```

---

## 2. Comprehensive Issue Analysis & Resolution Log

Below is the complete engineering record of every issue encountered during the live deployment, the exact symptoms observed, root causes identified, and solutions applied so these issues **never repeat**.

---

### Issue 1: GitHub Actions CI/CD Pipeline Failing in `mrask-frontend`

#### 🔴 Symptom & Error
In GitHub repository `mrask-frontend`, all CI/CD workflow runs displayed a red `X` failure icon.  
The runner log reported:
```text
Error: No file in /home/runner/work/mrask-frontend/mrask-frontend matched to [backend/requirements.txt or **/pyproject.toml]
```

#### 🔍 Root Cause
When the monolithic project was split into two independent repositories (`mrask-frontend` and `mrask-backend`), the frontend workflow `.github/workflows/ci.yml` retained a legacy job named `backend-check` that attempted to `cd ./backend` and install `backend/requirements.txt`. Because the backend had moved to its own repository, GitHub Actions runner failed on step execution.

#### 🛠️ Solution Applied
1. Edited [.github/workflows/ci.yml](file:///d:/Protifolo/portfolio-expo/.github/workflows/ci.yml) in `mrask-frontend`.
2. Removed the obsolete `backend-check` job completely.
3. Left `frontend-check` strictly executing:
   - `npm ci`
   - `npx tsc --noEmit` (TypeScript type verification)
   - `npx expo export --platform web` (Static export verification)
4. Committed and pushed commit `066633f`.

#### 🛡️ How to Prevent in the Future
- When extracting code into separate microservices or repositories, always audit `.github/workflows/` and delete obsolete cross-repo build steps.
- The backend has its own standalone workflow in [mrask-backend/.github/workflows/backend-ci.yml](file:///d:/Protifolo/mrask-backend/.github/workflows/backend-ci.yml).

---

### Issue 2: Static Files Missing & 404 Warnings on Render Backend

#### 🔴 Symptom & Error
Render backend logs reported:
```text
WARNING: No directory at: /opt/render/project/src/staticfiles/
404 GET /static/rest_framework/css/bootstrap.min.css
404 GET /static/rest_framework/js/jquery-3.5.1.min.js
```

#### 🔍 Root Cause
1. `render.yaml` originally executed:
   `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
2. If `staticfiles/` was not committed to git (due to `.gitignore`), WhiteNoise raised a startup warning before `collectstatic` could finish creating it.
3. In containerized cloud environments, `collectstatic` must run with target directory initialization before starting Gunicorn.

#### 🛠️ Solution Applied
1. Updated `render.yaml` in `mrask-backend`:
   ```yaml
   buildCommand: pip install -r requirements.txt && mkdir -p staticfiles && python manage.py collectstatic --noinput && python manage.py migrate
   ```
2. In `mrask-backend/config/settings.py`, added:
   ```python
   STATIC_URL = 'static/'
   STATIC_ROOT = BASE_DIR / 'staticfiles'
   WHITENOISE_AUTOREFRESH = True
   ```
3. Pushed fixes to `mrask-backend` main branch.

#### 🛡️ How to Prevent in the Future
- Always include `mkdir -p staticfiles` in the Render/Docker build command so the directory exists before WhiteNoise or Django inspects `STATIC_ROOT`.

---

### Issue 3: CORS Header Blocking Live Frontend Communication

#### 🔴 Symptom & Error
In production, the RAG Chatbot and Weather widgets failed to fetch data. The browser console showed:
```text
Access to fetch at 'https://mrask.onrender.com/api/weather/' from origin 'https://mrask-frontend.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

#### 🔍 Root Cause
1. In `mrask-backend/config/settings.py`, `CORS_ALLOWED_ORIGINS` strictly relied on parsing an environment variable:
   `CORS_ALLOWED_ORIGINS = env_list('CORS_ALLOWED_ORIGINS')`
2. If the Render Blueprint failed to apply the variable or if an environment variable typo occurred in the cloud dashboard, Django defaulted to rejecting all cross-origin requests.

#### 🛠️ Solution Applied
1. Made `mrask-backend/config/settings.py` self-healing by providing an immutable production fallback list:
   ```python
   _cors_env = env_list('CORS_ALLOWED_ORIGINS')
   CORS_ALLOWED_ORIGINS = list(set(_cors_env + [
       'https://mrask-frontend.vercel.app',
       'https://mrask-frontend-git-main-yt-studio11.vercel.app',
       'http://localhost:8081',
       'http://localhost:3000',
   ]))
   ```
2. Manually verified `CORS_ALLOWED_ORIGINS` in the Render Environment tab.

#### 🛡️ How to Prevent in the Future
- Never rely exclusively on cloud dashboard environment variables for your own known production frontend URLs; always supply fallback entries in Django's CORS configuration.

---

### Issue 4: Expo Environment Variable Baked as `localhost:8000`

#### 🔴 Symptom & Error
Even though the Render backend was healthy, the deployed Vercel frontend was sending requests to `http://localhost:8000/api/...`, which failed on client browsers.

#### 🔍 Root Cause
Expo Metro bundler inlines `EXPO_PUBLIC_*` variables **at build time**, not at runtime. If the Vercel project is built *before* `EXPO_PUBLIC_API_URL` is configured in Vercel's Environment Variables dashboard, the compiled JavaScript bundle hardcodes `http://localhost:8000`.

#### 🛠️ Solution Applied
1. Navigated to **Vercel Dashboard > Project Settings > Environment Variables**.
2. Created:
   - **Key:** `EXPO_PUBLIC_API_URL`
   - **Value:** `https://mrask.onrender.com`
   - **Environment:** Production, Preview, Development
3. Triggered a **Redeploy** on Vercel without build cache.

#### 🛡️ How to Prevent in the Future
- When deploying any Expo Web / React Native Web project to Vercel, always declare all `EXPO_PUBLIC_*` environment variables in the project settings **before** triggering the initial deployment.

---

### Issue 5: Vercel 404 NOT_FOUND on Page Refresh & Direct Deep Links

#### 🔴 Symptom & Error
Directly visiting or pressing `F5` / Refresh on:
- `https://mrask-frontend.vercel.app/project/weather-app`
- `https://mrask-frontend.vercel.app/project/rag-chatbot`
returned Vercel's system error:
```text
404 NOT_FOUND
This page doesn't exist
It may have been moved, removed, or never existed.
```

#### 🔍 Root Cause
1. Expo Router static web export (`"output": "static"` in `app.json`) uses dynamic route parameters for `app/project/[slug].tsx`.
2. Without an exported `generateStaticParams()` function, Expo export only created `dist/project/[slug].html` instead of `weather-app.html` or `rag-chatbot.html`.
3. With `"cleanUrls": true` enabled in `vercel.json`, Vercel looked on disk for `dist/project/weather-app.html`. Because the file did not exist, Vercel aborted with `404 NOT_FOUND` before fallback rewrites could be evaluated.

#### 🛠️ Solution Applied
1. **Implemented `generateStaticParams` in [app/project/[slug].tsx](file:///d:/Protifolo/portfolio-expo/app/project/%5Bslug%5D.tsx)**:
   ```typescript
   import { projects as defaultProjects } from '@/data/projects';

   export function generateStaticParams(): { slug: string }[] {
     return defaultProjects.map((p) => ({ slug: p.id }));
   }
   ```
   During `npx expo export --platform web`, Expo now generates physical static HTML files:
   - `dist/project/weather-app.html` (100 KB)
   - `dist/project/rag-chatbot.html` (114 KB)

2. **Updated Rewrites in [vercel.json](file:///d:/Protifolo/portfolio-expo/vercel.json)**:
   ```json
   "cleanUrls": true,
   "trailingSlash": false,
   "rewrites": [
     {
       "source": "/project/:slug",
       "destination": "/project/[slug].html"
     },
     {
       "source": "/(.*)",
       "destination": "/index.html"
     }
   ]
   ```
3. Pushed commit `c8bda97`. Vercel deployed the static pages, yielding `HTTP/1.1 200 OK` on all direct refreshes.

#### 🛡️ How to Prevent in the Future
- For any dynamic route (`[slug].tsx`) in Expo Web, **always** export `generateStaticParams()` providing all known IDs, so physical HTML files are compiled into `dist/`.
- Always pair `generateStaticParams` with an explicit fallback rewrite rule in `vercel.json` for dynamically generated routes.

---

### Issue 6: Fragile Browser Back Button on Deep Links

#### 🔴 Symptom & Error
When users refreshed a project page or opened it from an external link and clicked the `← Back` button, the app either failed to navigate or navigated backwards out of the website into the referrer (e.g. Vercel dashboard).

#### 🔍 Root Cause
The back button executed `router.back()`, which directly pops the browser history stack. On a fresh reload or direct link visit, the browser history stack for the website is empty or points to the external referring URL.

#### 🛠️ Solution Applied
Updated the Back button in [app/project/[slug].tsx](file:///d:/Protifolo/portfolio-expo/app/project/%5Bslug%5D.tsx):
```tsx
<Button
  label={'← Back to Projects'}
  variant="secondary"
  onPress={() => {
    router.replace('/projects');
  }}
/>
```
This guarantees that regardless of entry point or refresh state, the user is always safely returned to the Projects catalog.

#### 🛡️ How to Prevent in the Future
- Never rely solely on `router.back()` for primary in-app back buttons on web; use deterministic routing (`router.replace('/...')` or `router.push('/...')`).

---

## 3. Production Verification Matrix

| Verification Test | Target Route / Action | HTTP Status | Production Result |
| :--- | :--- | :--- | :--- |
| **CI/CD Pipeline** | GitHub Actions Workflow | `0 Errors` | ✅ Passed (Run #4 in 1m 8s) |
| **Direct Load & Refresh** | `/project/weather-app` | `200 OK` | ✅ Instant pre-rendered HTML |
| **Direct Load & Refresh** | `/project/rag-chatbot` | `200 OK` | ✅ Instant pre-rendered HTML |
| **Direct Load & Refresh** | `/projects` | `200 OK` | ✅ Instant pre-rendered HTML |
| **Live Weather API** | City Search: "Guntur" | `200 OK` | ✅ 28°C, Humidity 87%, 5-day forecast |
| **Live RAG Stream** | Ask Question: "What is summary..." | `200 OK` (SSE) | ✅ Token-by-token streaming answer |
| **Back Button Nav** | Click `← Back to Projects` | Client Nav | ✅ Smooth transition to `/projects` |

---

## 4. Engineering Runbook: How to Deploy Updates

### A. Deploying Frontend Changes
```powershell
# 1. Test TypeScript types locally
cd d:\Protifolo\portfolio-expo
npx tsc --noEmit

# 2. Test web export locally
npx expo export --platform web

# 3. Commit and push to GitHub
git add .
git commit -m "feat: your feature description"
git push origin main
```
*Vercel will automatically build and deploy the update in under 90 seconds. GitHub Actions CI will validate the build.*

### B. Deploying Backend Changes
```powershell
# 1. Run unit test suite locally
cd d:\Protifolo\mrask-backend
python manage.py test

# 2. Commit and push to GitHub
git add .
git commit -m "feat: your backend changes"
git push origin main
```
*Render will automatically run `pip install`, `mkdir -p staticfiles`, `collectstatic`, and `migrate`, then reload Gunicorn.*

---

## 5. Summary Reference

This documentation is maintained in the project repository to ensure that all future contributors and automated workflows follow these established architectural guidelines.
