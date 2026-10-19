# Frontend

React (Vite) client for the healthcare management API.

## Quick start

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:8000

npm install
npm run dev
```

App: `http://localhost:5173`  
The backend must be running and reachable at `VITE_API_URL`.

## Screens

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/register` | Create account |
| `/patients` | Manage patients |
| `/doctors` | Manage doctors |
| `/mappings` | Assign doctors to patients |

JWT access tokens are stored in `localStorage` after login or registration.
