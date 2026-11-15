# ADR 0005: PostgreSQL and Shared Prisma Infrastructure

## Status

Accepted for implementation.

## Context

Excel Dashboard requires transactional persistence for users, workspaces, datasets, dashboards and asynchronous processing metadata.

Multiple deployable applications need access to the same database schema.

## Decision

Use PostgreSQL as the transactional database.

Use Prisma ORM with the PostgreSQL driver adapter.

Maintain Prisma schema and migrations in a shared database package.

Use an explicit PostgreSQL connection pool per application process.

Use framework-independent transaction and error utilities.

Integrate the database package into NestJS through composition.

Keep spreadsheet analytical data in Parquet and query it through DuckDB.

## Alternatives considered

- Firestore as the primary metadata database
- TypeORM
- Drizzle ORM
- Direct SQL repositories without an ORM

## Consequences

The application benefits from relational constraints, transactional consistency and shared generated types.

Database schema changes require reviewed migrations.

Connection capacity must be managed across application replicas.

Prisma-generated SQL and analytical query workloads require separate performance considerations.

Tenant-aware repositories and row-level security must be implemented before production tenant data is introduced.
