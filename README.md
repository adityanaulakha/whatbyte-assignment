# Healthcare Management System

A full-stack healthcare backend and web app for user authentication, patient and doctor management, and patient–doctor assignments.

Built with **Node.js (Express)**, **PostgreSQL**, **JWT authentication**, and a **React** frontend.

## Features

- User registration and login with JWT (access + refresh tokens)
- Patient records scoped to the authenticated user (create, read, update, delete)
- Doctor directory shared across users (create, read, update, delete)
- Patient–doctor mappings (assign, list, view by patient, remove)
- Input validation and consistent API error responses
- Sensitive configuration via environment variables

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT (`jsonwebtoken`), password hashing (`bcryptjs`) |
| Validation | `express-validator` |
| Frontend | React, Vite, React Router |
| Config | `dotenv` |

## Project structure

```
.
├── backend/          # REST API
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth + error handling
│   │   └── routes/       # API routes
│   ├── scripts/          # DB schema init
│   ├── schema.sql
│   └── .env.example
└── frontend/         # Web UI (CareDesk)
    ├── src/
    │   ├── pages/        # Login, Register, Patients, Doctors, Mappings
    │   ├── components/
    │   └── api.js        # API client
    └── .env.example
```

## Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- npm

## Local setup

### 1. Database

Create a PostgreSQL database:

```bash
createdb healthcare
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=8000
DATABASE_URL=postgresql://YOUR_USER@localhost:5432/healthcare
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
```

Then:

```bash
npm install
npm run db:init
npm run dev
```

API runs at [http://localhost:8000](http://localhost:8000).

### 3. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
```

Ensure `.env` contains:

```env
VITE_API_URL=http://localhost:8000
```

Then:

```bash
npm install
npm run dev
```

UI runs at [http://localhost:5173](http://localhost:5173).

## API overview

Base URL (local): `http://localhost:8000`

Protected routes require:

```http
Authorization: Bearer <access_token>
```

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Register with `name`, `email`, `password` |
| POST | `/api/auth/login/` | Login; returns JWT tokens |

### Patients (authenticated; own records only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/patients/` | Create patient |
| GET | `/api/patients/` | List patients created by you |
| GET | `/api/patients/<id>/` | Get patient |
| PUT | `/api/patients/<id>/` | Update patient |
| DELETE | `/api/patients/<id>/` | Delete patient |

### Doctors (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doctors/` | Create doctor |
| GET | `/api/doctors/` | List all doctors |
| GET | `/api/doctors/<id>/` | Get doctor |
| PUT | `/api/doctors/<id>/` | Update doctor |
| DELETE | `/api/doctors/<id>/` | Delete doctor |

### Patient–doctor mappings (authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mappings/` | Assign doctor (`patient_id`, `doctor_id`) |
| GET | `/api/mappings/` | List mappings for your patients |
| GET | `/api/mappings/<patient_id>/` | Doctors assigned to a patient |
| DELETE | `/api/mappings/<id>/` | Remove a mapping |

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWTs |
| `PORT` | No | Defaults to `8000` |
| `JWT_EXPIRES_IN` | No | Defaults to `1h` |
| `JWT_REFRESH_EXPIRES_IN` | No | Defaults to `7d` |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend base URL (no trailing slash) |

Never commit `.env` files. Use `.env.example` as a template.

## Deployment

Typical setup:

1. **PostgreSQL** — hosted database (e.g. Render Postgres)
2. **Backend** — Node web service (e.g. Render); set `DATABASE_URL` and `JWT_SECRET`
3. **Frontend** — static/React host (e.g. Vercel); set `VITE_API_URL` to the deployed API URL

For a hosted database accessed from your machine (schema init), SSL is required. The backend enables SSL automatically for non-localhost `DATABASE_URL` values.

On Render, use the **Internal** database URL for the web service, and the **External** URL only for local tools like `npm run db:init`.

## Testing

- Use the web UI at `http://localhost:5173` after starting both servers
- Or call the API with Postman / curl (see [backend/README.md](backend/README.md))

## License

MIT
