# ADR 0003 — Backend Application Architecture

**Status:** Accepted for implementation

## Context

Excel Dashboard requires a maintainable backend supporting multi-tenant workspaces, spreadsheet ingestion, dataset management, analytical queries, visualizations, and dashboard publishing.

Spreadsheet processing and analytical execution have different resource requirements from ordinary HTTP requests.

## Decision

Use NestJS with Express as the primary REST API.

Organize business capabilities into independent feature modules within a modular monolith.

Deploy spreadsheet ingestion and analytical execution as separate worker applications.

Use validated environment configuration, standardized HTTP response contracts, global exception handling, and AsyncLocalStorage-based request context.

Use PostgreSQL for application metadata, Redis for queues and caching, and object storage for uploaded files and analytical artifacts in subsequent implementation phases.

## Alternatives considered

### Microservices from the beginning

Rejected because distributed deployment, service discovery, networking, and operational complexity would increase initial development costs.

### Single application performing all processing

Rejected because spreadsheet parsing and analytical queries could consume resources required for normal API traffic.

### Firebase-only backend

Rejected because the platform requires greater control over analytical execution, relational metadata, tenancy, and asynchronous processing.

## Consequences

- Feature boundaries can evolve independently within the API.
- Worker applications can scale independently.
- Shared packages can be extracted when multiple applications require the same capability.
- Request context provides infrastructure for future identity and workspace context.
- The modular monolith does not eliminate the need for explicit tenant isolation.
- Operational dependencies will be introduced incrementally.
