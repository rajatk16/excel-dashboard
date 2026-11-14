# Excel Dashboard API

The REST API for the Excel Dashboard multi-tenant analytics platform.

## Technology stack

- Node.js 24
- NestJS 11
- Express 5
- TypeScript
- Zod
- class-validator
- Jest and Supertest

## Local development

Run the following commands from the monorepo root:

```bash
npm ci
cp apps/api/.env.example apps/api/.env
npm run dev:api
```

The API listens on port 4000 by default.

Base URL: `http://localhost:4000/api/v1`

## Commands

| Command | Description |
|---|---|
| `npm run dev:api` | Start development server |
| `npm run build:api` | Build production application |
| `npm run start:api` | Start compiled application |
| `npm run test:api` | Run unit tests |
| `npm run test:api:e2e` | Run HTTP integration tests |

## Architecture

The application follows a modular monolith architecture. Business capabilities are implemented as independent NestJS feature modules.

Cross-cutting infrastructure is located in `src/common`, validated configuration in `src/config`, and application initialization in `src/bootstrap`.

Business modules should not depend on HTTP controllers from other modules.

## Environment configuration

Copy `.env.example` to `.env` before starting the application.

All configuration is validated at startup. Application services must consume configuration through `AppConfigService`.

Never commit secrets or local environment files.

## API conventions

- Versioned REST endpoints under `/api/v1`.
- Standardized success and error envelopes.
- Stable application error codes.
- DTO-based request validation.
- Request correlation through `X-Request-Id`.
- Cursor-based pagination for future collection endpoints.
- HTTP status codes reflect operation outcomes.

## Health endpoints

| Endpoint | Description |
|---|---|
| `/api/v1/health` | Application information |
| `/health/live` | Process liveness |
| `/health/ready` | Application readiness |

## Security

The application uses Helmet, explicit CORS origin allowlists, bounded request bodies, validated request identifiers, and sanitized
error responses.

Authentication and workspace authorization will be introduced in subsequent phases. Do not expose sensitive business endpoints before implementing these controls.

## Testing

Unit tests cover configuration and request context. HTTP integration tests cover routing, validation, error handling, response conventions, security headers, request limits, and health endpoints.

## Current implementation status

PR 1.5 establishes the application foundation.

PostgreSQL, Redis, object storage, Firebase authentication, structured logging, and business modules will be introduced in subsequent PRs.
