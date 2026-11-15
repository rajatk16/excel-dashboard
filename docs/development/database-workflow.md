# Database Development Workflow

## Start PostgreSQL

```bash
npm run db:up
```

## Apply migrations

```bash
npm run db:migrate:dev
```

## Generate Prisma Client

```bash
npm run db:generate
```

## Create a new migration

```bash
npm run db:migrate:dev -- --name add_example_model
```

## Build the database package

```bash
npm run build --workspace=@excel-dashboard/database
```

## Start the API

```bash
npm run dev:api
```

## Inspect data

```bash
npm run db:studio
```

## Run database tests

```bash
npm run test --workspace=@excel-dashboard/database
npm run test:integration
```

Integration tests require Docker.

## Stop PostgreSQL

```bash
npm run db:down
```

Stopping PostgreSQL preserves the named database volume.

## Reset development data

Verify the target database before executing:

```bash
npm run db:migrate:reset
```

This operation destroys existing data.

Never run it against staging or production databases.
