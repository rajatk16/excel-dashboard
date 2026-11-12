# ADR-0001: TypeScript Monorepo Strategy

## Status

Accepted

## Context

Excel Dashboard consists of multiple independently
deployable applications that share domain models,
contracts, infrastructure utilities and business logic.

Maintaining separate repositories would increase
coordination overhead and complicate cross-application
changes.

## Decision

Use a monorepo managed by Turborepo and npm workspaces.

All applications and internal packages will be
maintained in a single Git repository.

Applications will reside under apps/.

Reusable packages will reside under packages/.

All internal packages will use the
@excel-dashboard scope.

## Alternatives Considered

### Multiple Repositories

Provides independent repository ownership but
increases coordination and versioning overhead.

### Nx

Provides comprehensive monorepo tooling but
introduces additional conventions and tooling
that are not currently required.

### pnpm Workspaces

Provides efficient dependency management but
introduces a package manager different from
the selected npm workflow.

## Consequences

### Positive

- Atomic changes across applications and packages.
- Shared TypeScript configurations.
- Centralized dependency management.
- Reusable domain contracts.
- Dependency-aware build orchestration.
- Consistent development conventions.

### Negative

- Repository size will increase over time.
- Dependency boundaries require enforcement.
- CI must account for affected dependents.
- Shared package changes may impact multiple applications.

## Implementation

- npm workspaces
- Turborepo
- Single root package-lock.json
- Explicit workspace dependencies
- Independently deployable applications
- Incrementally introduced shared packages
