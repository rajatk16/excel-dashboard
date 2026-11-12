# Excel Dashboard

A multi-tenant SaaS platform for transforming spreadsheets
into interactive analytics dashboards.

## Product Vision

Enable individuals and organizations to create interactive
business intelligence dashboards from spreadsheet data
without requiring programming or SQL knowledge.

## Architecture

Excel Dashboard is a TypeScript-first monorepo managed
using Turborepo and npm workspaces.

### Applications

| Application      | Description                |
| ---------------- | -------------------------- |
| web              | React frontend             |
| api              | NestJS REST API            |
| ingestion-worker | Spreadsheet ingestion      |
| analytics-worker | Analytical query execution |

### Shared Packages

| Package           | Description                       |
| ----------------- | --------------------------------- |
| typescript-config | Shared TypeScript configuration   |
| eslint-config     | Shared ESLint flat configurations |

Additional packages will be introduced incrementally.

Additional packages will be introduced incrementally.

## Prerequisites

- Node.js 24.x
- npm >=11.6.2 <12
- Git

## Getting Started

### 1. Configure Node.js

```bash
nvm install
nvm use
```

### 2. Validate the environment

```bash
npm run doctor
```

### 3. Install dependencies

```bash
npm ci
```

### 4. Configure local environment variables

```bash
cp .env.example .env
```

The environment template contains configuration reserved
for subsequent infrastructure implementation.

## Development Commands

| Command               | Description                               |
| --------------------- | ----------------------------------------- |
| npm run doctor        | Validate the development environment      |
| npm run dev           | Run available development tasks           |
| npm run build         | Build implemented workspaces              |
| npm run lint          | Lint the repository                       |
| npm run lint:affected | Lint affected workspaces and root tooling |
| npm run lint:fix      | Automatically fix lint violations         |
| npm run format        | Format the repository                     |
| npm run format:check  | Check repository formatting               |
| npm run typecheck     | Run TypeScript checks                     |
| npm run test          | Run tests                                 |
| npm run check         | Run all quality checks                    |
| npm run clean         | Remove generated artifacts                |
| npm run clean:all     | Remove artifacts and dependencies         |

Application development, build and test commands become
operational as their corresponding applications are implemented.

## Repository Structure

```text
apps/
packages/
infrastructure/
scripts/
docs/
```

## Documentation

- [Product Documentation](docs/product/README.md)
- [Monorepo Architecture](docs/architecture/monorepo.md)
- [Monorepo ADR](docs/adr/0001-monorepo-strategy.md)
- [Local Development](docs/development/local-setup.md)
- [Coding Standards](docs/development/coding-standards.md)
- [Code Quality ADR](docs/adr/0002-code-quality-strategy.md)

## Development Status

Phase 1: Engineering Foundation

- [x] PR 1.1 - Monorepo Foundation
- [x] PR 1.2 - ESLint and Prettier
- [ ] PR 1.3 - React and Vite
- [ ] PR 1.4 - Tailwind and shadcn/ui
- [ ] PR 1.5 - NestJS API
- [ ] PR 1.6 - PostgreSQL and Prisma
- [ ] PR 1.7 - Redis and BullMQ
- [ ] PR 1.8 - Object Storage
- [ ] PR 1.9 - Docker
- [ ] PR 1.10 - Logging and Swagger
- [ ] PR 1.11 - Testing Infrastructure
- [ ] PR 1.12 - GitHub Actions

## License

Proprietary. All rights reserved.
