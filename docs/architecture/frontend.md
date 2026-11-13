# Frontend Architecture

## Overview

The Excel Dashboard frontend is a React and TypeScript single-page application built using Vite.

It resides in the apps/web workspace.

## Technology

- React
- TypeScript
- Vite
- React Router
- Zod
- ESLint
- Prettier

Additional frontend infrastructure is introduced incrementally as features require it.

## Directory Structure

```text
src/
  app/
  components/
  config/
  features/
  lib/
  styles/
```

## Application Composition

The browser entry point mounts the root App component.

App contains the application error boundary, global provider composition, and React Router provider.

## Routing

React Router data routers are used for navigation.

Routes are organized using nested layouts.

Page modules are loaded lazily.

Route constants are maintained centrally.

## Layouts

- RootLayout
- PublicLayout
- AuthLayout
- AppLayout

Authentication and workspace guards will be introduced during their respective phases.

## Features

Business functionality is organized by feature.

Each feature owns its pages, components, hooks, models, validation, and API integrations as required.

Feature-independent components belong under components/.

## Environment Configuration

Environment variables are validated using Zod.

Application code consumes the validated environment through getEnvironment().

VITE-prefixed variables are public browser configuration.

## Error Handling

The application error boundary handles global rendering and provider failures.

React Router error boundaries handle route failures.

Feature-specific asynchronous errors must be handled explicitly.

## Imports

The @/ alias resolves to src/.

Shared workspace dependencies must use their public package exports.

Server-only packages must not be imported into the frontend.

## Builds

TypeScript project builds validate source code.

Vite generates the production bundle.

Production hosting must support SPA route fallback.

## State Management

No global state management library is introduced until application features require it.

Server state and client state will be managed separately in subsequent implementation phases.
