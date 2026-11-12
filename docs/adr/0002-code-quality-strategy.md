# ADR-0002: Centralized Code Quality Strategy

## Status

Accepted

## Context

Excel Dashboard consists of multiple independently
deployable applications and reusable shared packages.

Maintaining separate linting and formatting configurations
would introduce inconsistencies and duplicated maintenance.

The platform also requires clear architectural boundaries
between browser and server implementations.

## Decision

Use ESLint flat configuration with a centralized
@excel-dashboard/eslint-config package.

Use Prettier as the independent formatting tool.

Provide specialized configurations for React, Node.js,
NestJS and shared libraries.

Use TypeScript Project Service for type-aware linting.

Use Turborepo to orchestrate workspace lint tasks.

Use root-level Prettier commands for repository formatting.

## Alternatives Considered

### Independent Workspace Configurations

Rejected because they would duplicate rules and increase
the likelihood of inconsistent standards.

### Legacy ESLint Configuration

Rejected in favor of ESLint flat configuration.

### Prettier Executed Through ESLint

Rejected to keep formatting and code quality concerns
separate.

## Consequences

### Positive

- Consistent coding standards.
- Reusable configurations.
- Type-aware correctness checks.
- Centralized rule maintenance.
- Dependency-aware lint caching.
- Early architectural violation detection.

### Negative

- Type-aware linting requires valid TypeScript projects.
- Shared configuration changes may affect many workspaces.
- Strict rules require occasional framework-specific
  exceptions.
- Import restrictions alone do not enforce the complete
  dependency graph.

## Implementation

- ESLint
- typescript-eslint
- Prettier
- eslint-config-prettier
- React and accessibility plugins
- Import sorting
- Workspace import restrictions
- Turborepo
