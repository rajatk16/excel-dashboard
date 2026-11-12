# @excel-dashboard/eslint-config

Shared ESLint flat configurations for the Excel Dashboard
monorepo.

## Available Configurations

| Export       | Purpose                                   |
| ------------ | ----------------------------------------- |
| ./base       | Shared JavaScript and TypeScript rules    |
| ./node       | Node.js applications and server libraries |
| ./react      | React applications and libraries          |
| ./nestjs     | NestJS applications                       |
| ./library    | Application-independent shared libraries  |
| ./boundaries | Workspace dependency restrictions         |

## Usage

### Node.js

```javascript
import { createNodeConfig } from '@excel-dashboard/eslint-config/node';

export default createNodeConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: true,
});
```

### React

```javascript
import { createReactConfig } from '@excel-dashboard/eslint-config/react';

export default createReactConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: true,
  fastRefresh: true,
});
```

### NestJS

```javascript
import { createNestConfig } from '@excel-dashboard/eslint-config/nestjs';

export default createNestConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: true,
});
```

### Shared Library

```javascript
import { createLibraryConfig } from '@excel-dashboard/eslint-config/library';

export default createLibraryConfig({
  tsconfigRootDir: import.meta.dirname,
  typeAware: true,
  browserSafe: true,
});
```

## Type-Aware Linting

TypeScript Project Service is used to resolve the
TypeScript project associated with each source file.

Every linted TypeScript source file must belong to
an appropriate TypeScript project.

For JavaScript-only configuration packages, set
typeAware to false.

## Formatting

Prettier is configured at the repository root.

ESLint is responsible for code quality and correctness.
Prettier is responsible for formatting.

## Architectural Boundaries

Applications must not import other applications.

Shared packages must expose public package interfaces.

Browser applications and browser-safe libraries must not
import server-only packages.

The import restrictions provide an initial safeguard.
Graph-level dependency validation will be introduced
as the monorepo grows.
