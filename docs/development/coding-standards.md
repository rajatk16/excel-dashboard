# Coding Standards

## Overview

Excel Dashboard uses ESLint and Prettier to maintain
consistent code quality across all applications and packages.

## Language

TypeScript is the primary implementation language.

Strict TypeScript compiler options are enabled.

Avoid explicit any types, unsafe assertions and
unexplained compiler suppressions.

## Naming

- Variables and functions: camelCase
- Classes and interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE
- Enum members: UPPER_SNAKE_CASE
- Files and directories: kebab-case
- React components: PascalCase
- React hooks: camelCase with a use prefix

## Formatting

- Two-space indentation
- Single quotes in JavaScript and TypeScript
- Double quotes in JSX attributes
- Semicolons
- Trailing commas
- LF line endings
- Preferred print width of 100 characters

Formatting is managed by Prettier.

## Imports

Imports are automatically ordered using ESLint.

Internal workspace imports must use the
@excel-dashboard package scope.

Do not import another application's implementation.

Do not import private package source or build files.

## Type Safety

Prefer explicit domain models.

Avoid any and non-null assertions.

Use type-only imports when runtime imports are unnecessary.

NestJS decorator metadata may require runtime imports.

## Asynchronous Operations

Promises must be awaited, returned or deliberately handled.

Detached asynchronous operations must handle rejection.

## Logging

Application code must use structured logging.

Console logging is permitted in development scripts
and configuration tooling.

## React

Follow the Rules of Hooks.

Provide stable keys when rendering collections.

Avoid unsafe HTML rendering.

Prefer accessible semantic HTML elements.

## Architecture

Applications represent deployment boundaries.

Reusable business logic belongs in shared packages.

Browser-safe packages must not depend on server-only
implementations.

## Commands

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run check
```

## Pull Requests

All pull requests must pass linting, formatting,
type checking and the applicable tests.

Lint suppressions must be narrowly scoped and justified.

Do not disable a rule globally to resolve an isolated issue.
