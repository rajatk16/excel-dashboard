# Design System

## Overview

Excel Dashboard uses a shared design system based on Tailwind CSS v4 and shadcn/ui conventions.

Reusable components reside in packages/ui.

## Design Principles

- Consistent semantic colors.
- Clear visual hierarchy.
- Accessible interactions.
- Responsive layouts.
- Minimal visual noise.
- Reusable component variants.

## Tokens

Design tokens are defined as CSS custom properties.

Components consume semantic Tailwind utilities such as:

- bg-background
- text-foreground
- bg-card
- text-muted-foreground
- bg-primary
- border-border

Avoid hardcoded colors in feature components.

## Themes

Supported theme preferences:

- Light
- Dark
- System

Theme preferences are persisted locally.

System preference changes and cross-tab changes are supported.

The resolved theme is applied to the document root.

## Component Ownership

Shared presentation components belong in packages/ui.

Business-specific components belong in the relevant application feature directory.

The UI package must not depend on application features.

## Responsive Layouts

The application uses a persistent desktop sidebar and a modal mobile navigation Sheet.

Public and authentication layouts adapt to smaller viewport widths.

## Accessibility

Use semantic HTML and accessible component primitives.

Interactive controls must have accessible names.

Keyboard navigation and focus visibility must be preserved.

Respect reduced-motion preferences.

## Notifications

Sonner provides application-wide toast notifications.

Use notifications for meaningful operation outcomes.

Do not replace persistent validation errors with temporary notifications.

## Charts

The design system defines initial chart color tokens.

The visualization phase will establish the full chart theme and accessibility strategy.

## Formatting

Prettier and prettier-plugin-tailwindcss maintain consistent formatting and utility class ordering.
