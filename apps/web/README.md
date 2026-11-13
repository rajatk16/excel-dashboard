# @excel-dashboard/ui

Shared React UI components and design system for the Excel Dashboard platform.

## Technology

- React
- TypeScript
- Tailwind CSS v4
- Radix UI
- shadcn/ui conventions
- Class Variance Authority
- Lucide React
- Sonner

## Usage

```tsx
import { Button } from '@excel-dashboard/ui/components/button';

export function Example() {
  return <Button>Save changes</Button>;
}
```

## Styles

The consuming application must import Tailwind CSS and the shared design tokens.

```css
@import 'tailwindcss';
@import '@excel-dashboard/ui/styles/globals.css';
```

The consuming application must also configure Tailwind to scan the UI package source files.

## Theme

Wrap the application with ThemeProvider.

```tsx
import { ThemeProvider } from '@excel-dashboard/ui/theme/provider';

<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>;
```

Access the theme through useTheme.

## Components

- Alert
- Badge
- Button
- Card
- Dropdown Menu
- Input
- Label
- Separator
- Sheet
- Skeleton
- Toaster

## Development

```bash
npm run lint -w @excel-dashboard/ui
npm run typecheck -w @excel-dashboard/ui
```

## Architecture

This package contains presentation components and design system infrastructure.

It must not depend on application routes, API clients, authentication stores, or business features.

Components are distributed as TypeScript source and compiled by the consuming application.

## Accessibility

Interactive components use accessible Radix UI primitives where appropriate.

Consumers remain responsible for accessible labels, descriptions, keyboard behavior, and page semantics.
