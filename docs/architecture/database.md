# Database Architecture

## Overview

Excel Dashboard uses PostgreSQL for transactional application metadata and DuckDB with Parquet for analytical spreadsheet data.

## Shared database package

The database schema, generated Prisma Client, migrations, connection factory, transaction manager and database errors are maintained in @excel-dashboard/database.

The package is framework-independent.

## Application lifecycle

Each API or worker process creates one database client.

Each client owns a bounded PostgreSQL connection pool.

NestJS integrates the client through DatabaseModule and PrismaService.

Database connections are closed during application shutdown.

## Connection management

Connection pool sizes are configured independently for each deployable application.

The combined maximum pool sizes across all replicas must fit within the PostgreSQL connection budget.

Reserve capacity for migrations, monitoring, administration and rolling deployments.

## Transactions

Transactions are propagated explicitly through transaction
client arguments.

Normal operations use PostgreSQL's default isolation level.

Critical concurrent invariants may use serializable transactions.

Only recognized transaction conflicts are automatically retried.

External side effects must not execute inside retried callbacks.

## Multi-tenancy

Every tenant-owned record will contain a workspace identifier.

Tenant-aware repositories and PostgreSQL row-level security will be implemented in Phase 3.

Tenant context must be transaction-local and derived from verified authorization.

## Migrations

Prisma migrations are the source of truth for schema changes.

Production migrations execute through a dedicated release job.

Breaking changes use expand-and-contract migration strategies.

## Security

Production runtime roles must not own application tables,
have schema modification privileges, or bypass row-level security.

Migration credentials are separate from runtime credentials.

Production database connections must use verified TLS.

Sensitive database errors are never exposed to API clients.
