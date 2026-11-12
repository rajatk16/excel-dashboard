# Monorepo Architecture

## Overview

Excel Dashboard uses a TypeScript-first monorepo
managed by Turborepo and npm workspaces.

The repository contains independently deployable
applications and reusable internal packages.

## Applications

- `apps/web`
- `apps/api`
- `apps/ingestion-worker`
- `apps/analytics-worker`

Applications represent deployment boundaries.

Applications must not import implementation code
directly from other applications.

## Packages

Shared functionality belongs under `packages/`.

Packages should have clear responsibilities and
explicit public interfaces.

## Dependency Rules

1. Applications may depend on shared packages.
2. Shared packages may depend on other shared packages.
3. Shared packages must not depend on applications.
4. Circular dependencies are prohibited.
5. Cross-workspace dependencies must be declared
   in package.json.
6. Browser applications must not depend on
   server-only packages.
7. Packages must expose public APIs through
   package exports.

## Dependency Direction

```text
Applications
    |
    v
Feature and Domain Packages
    |
    v
Infrastructure and Utility Packages
```

## Package Naming

All internal packages use the scope:

```text
@excel-dashboard/*
```

## Package Management

npm is the only supported package manager.

The repository maintains a single package-lock.json
at its root.

## Build Orchestration

Turborepo coordinates task execution and caching.

Dependencies are built before their consumers.

Long-running development tasks are not cached.

## TypeScript

Compiler configurations are shared through:

```text
@excel-dashboard/typescript-config
```

Applications and libraries extend the configuration
appropriate for their runtime.

## Deployment

Each application can be deployed independently.

Shared packages are build-time or runtime
dependencies of those applications.
