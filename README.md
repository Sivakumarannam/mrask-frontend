# Mr.A.S.K Portfolio

A responsive portfolio built with Expo, React Native, and Expo Router, with a separate Django REST API for project data, weather, contact messages, and the RAG demo.

## Live services

- Frontend: <https://mrasksiva.vercel.app/>
- Backend API: <https://mrask.onrender.com>
- Projects API: <https://mrask.onrender.com/api/projects/>
- Weather API example: <https://mrask.onrender.com/api/weather/?city=Hyderabad>

The backend root URL (`/`) is not a website homepage. Use an `/api/...` endpoint to test it.

## Features

- Portfolio pages: Home, About, Projects, Skills, Services, and Contact.
- Project detail pages for the RAG chatbot and weather app.
- Weather demo backed by Open-Meteo through the Django API.
- Contact form with required name, email, and message fields.
- Django saves contact submissions to its configured database and can send email through Gmail SMTP.
- PDF/text RAG demo; see [the full setup and deployment guide](./docs/PROJECT-SETUP-AND-DEPLOYMENT.md) for its current local/production limitations.

## Technology

- Frontend: Expo, React Native, Expo Router, TypeScript
- Backend: Django REST Framework
- Local database: SQLite unless PostgreSQL environment variables are configured
- Production database: PostgreSQL
- Hosting: Vercel frontend and Render backend

## Run locally

Use two terminals. Follow the [complete Windows setup, testing, and deployment guide](./docs/PROJECT-SETUP-AND-DEPLOYMENT.md) for prerequisites, environment variables, email testing, troubleshooting, and safe Git push instructions.

### Backend terminal

```powershell
cd D:\Protifolo\portfolio-expo\backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_projects
python manage.py runserver 0.0.0.0:8000
```

If Python 3.12 is not installed, use `python -m venv .venv` instead of `py -3.12 -m venv .venv`.

### Frontend terminal

```powershell
cd D:\Protifolo\portfolio-expo
npm install
npx expo start --web --port 8081 --clear
```

Open the URL printed by Expo (usually <http://localhost:8081>). The root `.env` should contain:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
```

## Useful commands

```powershell
# Frontend type check and web production build
npm run check
npm run build

# Backend checks and database operations (from backend/)
python manage.py check
python manage.py migrate
python manage.py seed_projects
python manage.py runserver 0.0.0.0:8000
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/projects/` | List published projects |
| GET | `/api/projects/<slug>/` | Get a project |
| GET | `/api/weather/?city=Hyderabad` | Get current weather and a 5-day forecast |
| POST | `/api/contact/` | Validate and save a contact message; attempt SMTP email |
| POST | `/api/rag/ask/` | Upload a document and ask a question |

## Contact email behavior

The form's **Email** field is the visitor's reply address. The destination inbox is configured separately with `CONTACT_EMAIL_TO` in `backend/.env` locally or the Render backend service environment. An API response with `email_sent: true` means the SMTP server accepted the send request; still check Inbox and Spam. Full email configuration and safe test steps are in the [deployment guide](./docs/PROJECT-SETUP-AND-DEPLOYMENT.md#contact-form-and-email).

## Repository/deployment caution

The frontend and backend should be pushed and deployed separately. Before any Git push, run `git remote -v` and confirm the repository. This workspace has previously had its `origin` set to the backend repository, so do not push frontend changes until the remote/repository is verified. The guide has a careful checklist.

## Documentation

- [Complete project history, local commands, environment setup, testing, troubleshooting, and deployment](./docs/PROJECT-SETUP-AND-DEPLOYMENT.md)
