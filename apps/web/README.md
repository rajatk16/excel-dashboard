# Excel Dashboard Web

React frontend for the Excel Dashboard SaaS platform.

## Technology

- React
- TypeScript
- Vite
- React Router
- Zod

## Development

Run all commands from the repository root.

### Install Dependencies

```bash
npm ci
```

### Configure Environment

```bash
cp apps/web/.env.example apps/web/.env.local
```

### Start Development Server

```bash
npm run dev:web
```

The application is available at:

http://localhost:3000

## Commands

| Command | Description |
| --- | --- |
| npm run dev:web | Start frontend development |
| npm run preview:web | Preview production build |
| npm run build | Build applications |
| npm run typecheck | Run TypeScript checks |
| npm run lint | Run ESLint |
| npm run format:check | Verify formatting |

## Routes

| Route | Description |
| --- | --- |
| / | Landing page |
| /login | Login placeholder |
| /register | Registration placeholder |
| /app | Application overview |

## Architecture

The application uses feature-based organization, nested layouts, lazy route modules, validated environment configuration, and error boundaries.

## Environment Variables

| Variable | Description |
| --- | --- |
| VITE_APP_NAME | Application display name |
| VITE_APP_ENV | Application environment |
| VITE_API_BASE_URL | Backend API base URL |

All VITE-prefixed variables are public.

## Production Build

The production bundle is generated under dist/.

The hosting layer must support SPA route fallback.

## Implementation Status

The frontend application foundation is implemented.

Authentication, workspace management, data ingestion, analytics, and dashboard functionality are not yet available.
