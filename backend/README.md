# Backend API

Express + PostgreSQL REST API with JWT authentication for the healthcare management system.

## Quick start

```bash
cp .env.example .env
# set DATABASE_URL and JWT_SECRET

npm install
npm run db:init
npm run dev
```

Server: `http://localhost:8000`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with file watching |
| `npm start` | Start production server |
| `npm run db:init` | Apply `schema.sql` to the database |

## Example requests

### Register

```bash
curl -s -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

### Login

```bash
curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

### Authenticated request

```bash
TOKEN="<access_token>"

curl -s http://localhost:8000/api/patients/ \
  -H "Authorization: Bearer $TOKEN"
```

Full endpoint list is in the root [README.md](../README.md).
