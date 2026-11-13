# ADR-0003: React Frontend Architecture

## Status

Accepted

## Context

Excel Dashboard requires a scalable frontend for spreadsheet ingestion, data exploration, analytical queries, visualizations, and dashboard composition.

The application must support multiple layouts, workspace-specific routes, and future authentication and authorization requirements.

## Decision

Use React and TypeScript with Vite.

Use React Router data routers for client-side routing.

Organize business functionality using a feature-based directory structure.

Use route-level lazy loading.

Maintain separate TypeScript projects for browser application code and Node.js development tooling.

Validate public environment configuration using Zod.

Provide application-level and route-level error boundaries.

Introduce additional providers and state management libraries incrementally.

## Alternatives Considered

### Next.js

Provides server-side rendering and full-stack application capabilities.

Not selected because the platform already has a dedicated NestJS backend and does not currently require server-side rendering.

### Create React App

Not selected because Vite provides a more appropriate modern development and build workflow.

### Global Technical-Layer Organization

Not selected because grouping all hooks, services, models, and pages globally would make feature ownership harder as the application grows.

## Consequences

### Positive

- Fast development feedback.
- Clear feature ownership.
- Route-level code splitting.
- Independent frontend deployment.
- Strong TypeScript validation.
- Incremental infrastructure adoption.

### Negative

- SPA hosting requires route fallback configuration.
- Public marketing pages are client-rendered.
- Feature boundaries require continued enforcement.
- Build-time environment variables require
  environment-aware deployment configuration.
