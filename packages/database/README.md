# @excel-dashboard/database

Shared PostgreSQL and Prisma infrastructure for Excel Dashboard.

## Responsibilities

- PostgreSQL schema and migrations
- Generated Prisma Client
- Database environment validation
- PostgreSQL connection pool management
- Transaction execution and bounded retries
- Framework-independent database error normalization

This package must not depend on application workspaces or NestJS.

## Local setup

From the monorepo root:

```bash
npm run db:up
cp packages/database/.env.example packages/database/.env
npm run db:migrate:dev
npm run db:generate
npm run build --workspace=@excel-dashboard/database
```

## Public API

```typescript
import {
  createDatabaseClient,
  validateDatabaseEnvironment,
  TransactionManager,
} from '@excel-dashboard/database';
```

Create one database client per running application process.

Always dispose the client when the application shuts down.

## Schema changes

1. Modify prisma/schema.prisma.
2. Generate a named development migration.
3. Review the generated SQL.
4. Apply the migration.
5. Generate Prisma Client.
6. Run unit and integration tests.
7. Commit the schema and migration files.

Never commit generated Prisma Client files.

## Production migrations

Run `npm run db:migrate:deploy` through a dedicated deployment job.

Do not execute development migration or reset commands against production databases.

## Security

Database URLs are secrets.

Use separate runtime and migration credentials in production.

Never expose raw database errors or SQL statements to API clients.

Tenant-aware repositories and PostgreSQL row-level security will be introduced in Phase 3.
