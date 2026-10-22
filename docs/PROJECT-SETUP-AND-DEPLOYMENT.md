# Project Setup, Testing, and Deployment Guide

This document describes the portfolio as it currently exists: its features, local development commands, contact/email behavior, environment variables, deployment layout, and safe release process.

## 1. What this project is

This is a portfolio website and API, split into two parts:

1. **Frontend** — Expo + React Native + Expo Router, exported as a static website and hosted on Vercel.
2. **Backend** — Django REST Framework API hosted on Render, using PostgreSQL when its database environment variables are configured.

The portfolio presents the owner's profile, skills, services, and two projects:

- **RAG Chatbot** — a document question-answering demo based on a PDF/text workflow.
- **Weather App** — an interactive weather page that calls the Django API, which fetches data from Open-Meteo.

The backend is an API, not a separate portfolio website. A 404 at `https://mrask.onrender.com/` is expected because no root-page route is defined. Test `/api/...` endpoints instead.

## 2. Project history and implemented work

The work completed across the project has included:

- Reviewing the original Expo/Django project and its behavior.
- Redesigning the portfolio as a dark, editorial-style interface with Home, About, Projects, Skills, Services, and Contact pages.
- Building project cards and dynamic detail pages from project data, with repository links and demo flows.
- Adding a responsive navigation layout for narrow/mobile screens.
- Adding a Django API for project data and the live weather demo.
- Adding a PDF/text RAG upload and question-answer flow.
- Separating frontend and backend deployment responsibilities: Vercel for the frontend, Render for the backend.
- Adding the Contact form with required name, email, and message fields, client-side checks, a loading state, and user-visible success/error feedback.
- Connecting the Contact form to Django's `/api/contact/` endpoint, which saves the message and attempts Gmail SMTP delivery.
- Running the frontend TypeScript check and web export after the Contact form changes.
- Testing the local contact flow through the browser and API; a response with `email_sent: true` was returned for a clearly labeled test.

### Current limitations to know

- The visitor's email is not the delivery destination. It is included with the message so the owner can reply. `CONTACT_EMAIL_TO` selects the inbox that receives the message.
- Contact emails use the visitor's submitted address as the message `Reply-To`, so replying from the owner's inbox goes back to the visitor.
- If the API is unavailable, the Contact page offers a pre-filled Gmail draft addressed to the public portfolio email. This is a manual backup: the visitor must review and press Send in Gmail.
- SMTP accepting a message (`email_sent: true`) does not guarantee it appears in Inbox; check Spam and confirm the recipient value.
- The deployed backend requirements are intentionally light and do not include `faiss`, `sentence-transformers`, or `torch`. The backend's RAG code can fall back to plain text chunks, and Ollama generation requires an Ollama server reachable at `OLLAMA_BASE_URL`. `localhost` in a cloud service points to that service itself, not a developer's computer. Do not describe the hosted demo as a production-hosted LLM unless a reachable model service has actually been configured and verified.
- The weather endpoint depends on the external Open-Meteo service, so network/provider failures can temporarily cause a 502.
- The contact API reports `email_sent` in its JSON response. The existing backend catches SMTP failures and reports a failed email delivery instead of claiming an email was sent.

## 3. Folder layout

```text
portfolio-expo/
├── app/                    # Expo Router pages
│   ├── (tabs)/              # Home/About/Projects/Skills/Services/Contact
│   └── project/[slug].tsx   # Project detail page
├── assets/                  # Images and fonts
├── components/              # Shared UI, project, weather, and RAG components
├── constants/               # Theme
├── data/                    # Profile, skills, and local project fallback data
├── lib/                     # API client, hooks, and external link helpers
├── backend/                 # Django API project
│   ├── config/              # Django settings and URL configuration
│   ├── portfolio/           # Models, API views, serializers, seed command
│   ├── manage.py
│   └── requirements.txt
├── docs/
├── package.json
├── vercel.json
└── README.md
```

There are two `.env` locations with different purposes:

- `portfolio-expo/.env` — frontend API URL.
- `portfolio-expo/backend/.env` — local Django settings, database, and SMTP configuration.

The backend `.env` is ignored by Git. In the current checkout the root frontend `.env` is tracked and contains the local API URL; it must never contain passwords or private credentials. Treat `.env.example` files as templates only and keep all secrets out of Git and documentation.

## 4. Prerequisites

Install:

- Node.js and npm (use the versions compatible with the project's Expo SDK).
- Python 3.12 is recommended for local setup; use the same Python version consistently for the venv.
- Git, if you plan to push code.
- Optional: PostgreSQL for local PostgreSQL testing. The backend uses SQLite if `POSTGRES_DB` is not defined.
- Optional: a Gmail App Password if you want local contact submissions to send actual email.

## 5. Local development on Windows

### 5.1 Configure the frontend API URL

In `D:\Protifolo\portfolio-expo\.env`, set:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Expo reads this environment value when it starts. Restart Expo after changing it.

### 5.2 Configure the backend

The backend reads `D:\Protifolo\portfolio-expo\backend\.env`. Start from `backend/.env.example` if needed.

For local SQLite, do not define `POSTGRES_DB`. If the local `.env` defines it, Django will use PostgreSQL instead and a local PostgreSQL server with matching values must be running.

Example local development values (replace the secret placeholder; do not use it in production):

```env
DJANGO_SECRET_KEY=local-development-only-change-this
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
```

The settings allow all origins while `DJANGO_DEBUG=True`, which avoids local Expo CORS configuration problems. Production must use `DJANGO_DEBUG=False` and explicit origins.

### 5.3 Start the backend (Terminal 1)

Open PowerShell:

```powershell
cd D:\Protifolo\portfolio-expo\backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_projects
python manage.py check
python manage.py runserver 0.0.0.0:8000
```

If `py -3.12` is not available but Python is installed, replace the venv command with:

```powershell
python -m venv .venv
```

Keep this terminal open. The API should be reachable at:

- <http://localhost:8000/api/projects/>
- <http://localhost:8000/api/weather/?city=Hyderabad>

`seed_projects` can be run more than once; it updates or creates the two portfolio project records.

### 5.4 Start the frontend (Terminal 2)

Open a second PowerShell window:

```powershell
cd D:\Protifolo\portfolio-expo
npm install
npx expo start --web --port 8081 --clear
```

Open the local URL printed by Expo, normally <http://localhost:8081>. Keep the frontend terminal open too.

If changing `.env` while Expo is running, stop Expo with Ctrl+C and start it again with `--clear`.

### 5.5 Verify local backend connectivity

In PowerShell:

```powershell
Invoke-RestMethod "http://localhost:8000/api/projects/"
Invoke-RestMethod "http://localhost:8000/api/weather/?city=Hyderabad"
```

If the browser form says `Failed to fetch`:

1. Check that Terminal 1 still has Django running.
2. Check that the root `.env` points to `http://localhost:8000`.
3. Check the browser's request URL; it must be `http://localhost:8000/api/contact/` for local testing.
4. Check that the Expo page origin is local (`http://localhost:8081`).
5. Restart Expo if you changed `.env`.

Do not start only the frontend and expect contact submission to work; the Django API must also be running.

## 6. Contact form and email

### 6.1 What each field means

- **Name** — the visitor's name.
- **Email** — the visitor's reply-to/contact address. It is not automatically where the message is delivered.
- **Message** — the visitor's text.
- **`CONTACT_EMAIL_TO`** — the owner's destination inbox. This is where Django sends the message.

The backend saves the contact record to its configured database and attempts to send it through SMTP. Its JSON response includes `email_sent`.

- `email_sent: true`: the SMTP server accepted the send request; check the destination's Inbox and Spam.
- `email_sent: false`: the record was saved, but email could not be sent or SMTP is not configured.

When SMTP succeeds, Django sends the message to `CONTACT_EMAIL_TO`, with the visitor's address set in `Reply-To`. The visitor's form address is not the delivery recipient.

If Django cannot be reached, the frontend cannot save the message or send it through SMTP. It displays an error and provides an **Open pre-filled Gmail draft** backup. The visitor must send that draft themselves. A static website cannot safely send SMTP mail directly because credentials must never be shipped to the browser.

### 6.2 Gmail SMTP setup for local testing

In `backend/.env`, use the following keys:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=your-sending-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-google-app-password
DEFAULT_FROM_EMAIL=your-sending-gmail@gmail.com
CONTACT_EMAIL_TO=the-inbox-that-should-receive-messages@gmail.com
```

Use a Google **App Password**, not your regular Google password. Never commit the App Password, paste it into chat, or put it in the frontend `.env`. Keep the sender Gmail and destination inbox values distinct if desired.

After updating backend `.env`, stop and restart Django so it reloads the environment.

### 6.3 Test local form submission

Use the local frontend with Django running. Enter a test name, an email address you control, and a short message, then submit.

To test the API directly from PowerShell:

```powershell
$body = @{
  name = "Local Contact Test"
  email = "your-test-address@example.com"
  message = "Testing the local portfolio contact form."
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:8000/api/contact/" `
  -ContentType "application/json" `
  -Body $body
```

Replace the sample email with an address you control if you want the owner to be able to reply. The message destination remains `CONTACT_EMAIL_TO`.

After submission:

1. Read the page's success/error response.
2. For API testing, inspect the returned `email_sent` value.
3. Check the exact `CONTACT_EMAIL_TO` inbox, including Spam.
4. Check the sending account's Sent folder and Google security/App Password setup if the email is absent.
5. Do not submit repeatedly; contact requests are rate-limited.

A previous local API and browser test received `email_sent: true`, but each used clearly labeled test content, not the visitor details shown in the screenshot. The screenshot's `Failed to fetch` request did not reach Django because the backend was not running at that moment. The configured `CONTACT_EMAIL_TO` was also checked and does not match the inbox you said you want to receive messages. Set it to the inbox you actually check, restart Django, and submit one new labeled test. Do not assume the earlier Deadshot form attempt was delivered.

## 7. Backend API reference

| Method | URL | Request | Purpose |
|---|---|---|---|
| GET | `/api/projects/` | None | List published project records |
| GET | `/api/projects/<slug>/` | None | Retrieve one project |
| GET | `/api/weather/?city=<city>` | Query parameter `city` | Current weather and 5-day forecast via Open-Meteo |
| POST | `/api/contact/` | JSON `name`, `email`, `message` | Save a contact and attempt email |
| POST | `/api/rag/ask/` | Multipart `question` and `file` | Extract document text and answer using available RAG/model services |

Project data is stored in Django's `Project` model and can be seeded with `python manage.py seed_projects`.

The Contact endpoint is POST-only; opening it with GET may show `405 Method Not Allowed`, which is expected.

## 8. Production deployment architecture

Deploy these as separate projects/services:

- **Frontend**: GitHub frontend repository → Vercel.
- **Backend**: GitHub backend repository → Render Web Service.
- **Database**: Render PostgreSQL attached to the backend service.

Do not put frontend environment variables in Render, or backend secrets in Vercel.

### 8.1 Frontend on Vercel

Vercel project settings:

- Framework/build: Expo web export.
- Build command: `npm run build`.
- Output directory: `dist`.
- Production environment variable:

```env
EXPO_PUBLIC_API_URL=https://mrask.onrender.com
```

Deploy/redeploy after changing the environment variable or frontend code. Static build-time environment variables require a new build.

### 8.2 Backend on Render

Create/use a Render **Web Service** connected to the backend GitHub repository, not the PostgreSQL service.

Set its Root Directory based on the actual checked-out repository:

- If `manage.py` and `requirements.txt` are inside a `backend` directory, set Root Directory to `backend`.
- If they are directly in the repository root, leave Root Directory blank.

Typical commands when the service working directory contains `manage.py` and `requirements.txt`:

Build command:

```bash
pip install -r requirements.txt
```

Start command (works without opening Render Shell and runs migrations/seeding during service startup):

```bash
python manage.py migrate && python manage.py seed_projects && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

The seed command uses `update_or_create`, so repeated startup is safe. If the service is repeatedly restarted, migrations/seeding will also run each start. For larger systems, use a dedicated release/pre-deploy command instead.

Set the production Python version using Render's supported configuration for the selected runtime and verify the actual Python version in deployment logs. Logs previously shared for this service showed Python 3.14.8; do not assume it changed to 3.12 unless Render logs confirm it.

### 8.3 Render PostgreSQL

Create a PostgreSQL database in Render. Copy its actual database name, user, password, internal hostname, and port into the backend Web Service environment. Do not invent credentials and do not use a public connection URL where Render's internal hostname is available.

Backend database variables:

```env
POSTGRES_DB=<database name supplied by Render>
POSTGRES_USER=<database user supplied by Render>
POSTGRES_PASSWORD=<database password supplied by Render>
POSTGRES_HOST=<internal database hostname supplied by Render>
POSTGRES_PORT=5432
```

The Django settings select PostgreSQL when `POSTGRES_DB` is set; otherwise they use the local SQLite database file.

### 8.4 Render backend environment variables

Set these in the **Render backend Web Service → Environment**, not in the PostgreSQL project:

```env
DJANGO_SECRET_KEY=<long unique random secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=mrask.onrender.com
CORS_ALLOWED_ORIGINS=https://mrasksiva.vercel.app
CSRF_TRUSTED_ORIGINS=https://mrasksiva.vercel.app,https://mrask.onrender.com

POSTGRES_DB=<Render database name>
POSTGRES_USER=<Render database user>
POSTGRES_PASSWORD=<Render database password>
POSTGRES_HOST=<Render internal database hostname>
POSTGRES_PORT=5432

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
EMAIL_HOST_USER=<sending Gmail address>
EMAIL_HOST_PASSWORD=<Google App Password>
DEFAULT_FROM_EMAIL=<sending Gmail address>
CONTACT_EMAIL_TO=<destination inbox>
```

Do not copy placeholders literally. Use actual Render PostgreSQL values. Never add the Django secret or Gmail App Password to frontend environment variables or commit them.

If using a Vercel preview/custom domain, add only the exact origins that should be allowed to `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`, separated by commas. Restart/redeploy the backend after environment changes.

### 8.5 Verify deployments

Backend:

- `https://mrask.onrender.com/api/projects/` should return HTTP 200 and project JSON.
- `https://mrask.onrender.com/api/weather/?city=Hyderabad` should return weather JSON if the upstream service is available.
- `https://mrask.onrender.com/` may return 404; that is expected.
- `GET https://mrask.onrender.com/api/contact/` may return 405; the endpoint expects POST.

Frontend:

- Open <https://mrasksiva.vercel.app/>.
- Open `/projects`, both project detail pages, and `/contact`.
- Submit one deliberate test contact, then verify `email_sent` behavior/logs/inbox as described above.
- Test the site at phone width and on a real device where possible.

## 9. Git and deployment workflow

### 9.1 Always check repository identity before pushing

From Git Bash:

```bash
cd /d/Protifolo/portfolio-expo
git status --short --branch
git remote -v
git branch --show-current
```

**Important:** the local Git `origin` in this workspace was observed pointing to `https://github.com/Sivakumarannam/mrask-backend.git`, while Contact page and frontend files belong in the frontend repository. Do not run `git push` from this checkout until you confirm it is the intended frontend working copy. A frontend change pushed into the backend repository will not cause Vercel to deploy it.

Keep separate working copies for the frontend and backend. Before changing a remote URL, confirm the target repository and that the local branch/history belongs there; changing `origin` alone does not split the files or safely migrate Git history.

### 9.2 Check and commit frontend changes

In the intended frontend repository:

```bash
npm run check
npm run build
git status --short
git diff --check
git diff
```

Stage only the intended frontend files, after checking the diff:

```bash
git add "app/(tabs)/contact.tsx" lib/api.ts
git diff --cached
git commit -m "Add required contact form"
git push origin main
```

If your frontend branch is not `main`, replace `main` with the branch shown by `git branch --show-current`.

### 9.3 Backend changes

Make and commit backend-only changes in the backend repository. Run backend checks and local migration/seed commands first. Then push the backend branch connected to the Render Web Service and verify its deployment logs.

### 9.4 Automatic deploys

If Vercel is connected to the frontend repository/branch, a push to that branch triggers the frontend build. If Render is connected to the backend repository/branch, a backend push triggers its deploy. Confirm each provider is linked to the intended repository and branch; a successful Git push alone does not prove the correct service redeployed.

## 10. Troubleshooting

### Frontend shows `Failed to fetch`

- Start Django in a separate terminal.
- Confirm the root `.env` has `EXPO_PUBLIC_API_URL=http://localhost:8000`.
- Check `http://localhost:8000/api/projects/` directly.
- Confirm CORS is allowing the local origin. With `DJANGO_DEBUG=True`, this project enables all CORS origins.
- Restart Expo with `npx expo start --web --port 8081 --clear`.

### Project list errors on Render

- Check the Render Web Service logs.
- Confirm the service uses the intended PostgreSQL environment variables.
- Check migrations completed in the startup logs.
- Check `seed_projects` ran and emitted `Created` or `Updated` output.
- Test the API endpoint directly.

### Contact says it was received but no email arrives

- Confirm the response's `email_sent` value.
- Confirm `CONTACT_EMAIL_TO` is the inbox you are checking. The visitor's form email is not the destination.
- Check Inbox, Spam, and the sender account's Sent folder.
- Confirm `EMAIL_HOST_USER` is the sending account and `EMAIL_HOST_PASSWORD` is its Google App Password.
- Restart Django locally or redeploy Render after environment changes.
- Avoid repeated form submissions while diagnosing; each valid POST is saved.

### Weather returns 502

- Check if Open-Meteo is reachable and try again later.
- Verify Django can make outbound HTTPS requests.
- Confirm a valid city is included in the query, for example `?city=Hyderabad`.

### Backend root returns 404

This API-only backend has no root route. Use an `/api/...` URL.

## 11. Next recommended work

1. Confirm `CONTACT_EMAIL_TO` points to the inbox the owner actually checks; test one submission locally and one after deployment.
2. Make contact delivery failures easier to diagnose by logging SMTP exceptions server-side without exposing credentials.
3. Decide whether the RAG demo is a clearly labeled local demo or a hosted-model product; verify semantic retrieval and generated answers before making production claims.
4. Add screenshots and concise problem/approach/result case studies to both project pages.
5. Test all pages on phone widths, keyboard navigation, accessible labels, and reduced-motion settings.
6. Add a backend health endpoint, production monitoring, and backup/retention plans for contact records.
7. Keep the frontend/backend Git repositories and deployment environments clearly separated.
