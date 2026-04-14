# HAS Frontend (Vite + React)

## Run

```bash
npm install
npm run dev
```

Default app URL: `http://localhost:5173`

## Backend integration

The app calls backend APIs via Vite proxy (`/api` -> `http://localhost:8080`).

Use `.env` values:

```env
VITE_API_BASE_URL=/api
VITE_USE_BACKEND=true
VITE_BACKEND_USERNAME=admin
VITE_BACKEND_PASSWORD=admin123
```

If backend is unavailable or a flow is not yet mapped, UI uses fallback data so the pages remain demo-stable.
