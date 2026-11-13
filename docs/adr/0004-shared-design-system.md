# ADR-0004: Shared Design System

## Status

Accepted

## Context

Excel Dashboard requires a consistent visual language across spreadsheet ingestion, data exploration, visualizations, dashboards, and workspace management.

Duplicating UI components across features and future applications would increase maintenance costs.

## Decision

Use Tailwind CSS v4 with its native Vite plugin.

Create a shared @excel-dashboard/ui workspace.

Use shadcn/ui conventions and Radix UI primitives.

Maintain semantic design tokens as CSS custom properties.

Support light, dark, and system themes.

Distribute internal UI components as TypeScript source.

Use Sonner for toast notifications.

Use Lucide React for application icons.

## Alternatives Considered

### Application-local UI Components

Rejected because future applications would need to duplicate the design system.

### Separate UI Library Bundling

Deferred because the package is currently consumed inside a controlled Vite monorepo.

### Fully Custom Interaction Primitives

Rejected because accessible keyboard navigation, focus management, and modal behavior require significant implementation effort.

## Consequences

### Positive

- Consistent visual design.
- Shared component ownership.
- Accessible interaction primitives.
- Centralized theme management.
- Reduced styling duplication.

### Negative

- Consuming applications must scan shared UI sources.
- Source distribution requires compatible bundlers.
- Shared component changes may affect multiple applications.
- Production CSP must account for initial theme setup.

## Future Work

- Component testing.
- Visual regression testing.
- Additional form primitives.
- Data table components.
- Chart theme integration.
- Expanded dashboard-specific components.
