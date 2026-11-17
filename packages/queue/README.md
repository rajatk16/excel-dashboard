# @excel-dashboard/queue

Shared Redis and BullMQ infrastructure for Excel Dashboard.

## Responsibilities

- Redis connection management
- Typed queue and job contracts
- Runtime payload validation
- Job producers and consumers
- Retry and retention policies
- Deterministic job identifiers
- Queue health checks
- Queue event monitoring
- Failed-job administration
- Worker runtime and graceful shutdown

## Local setup

```bash
npm run redis:up
cp packages/queue/.env.example packages/queue/.env
npm run build --workspace=@excel-dashboard/queue
```

## Active queues

- ingestion-probe
- analytics-probe

Future business queues must not be activated before their processors and persistence workflows are implemented.

## Queue administration

```bash
npm run queue:admin -- stats
npm run queue:admin -- failed ingestion-probe
```

Mutating development commands require explicit opt-in.

## Delivery semantics

BullMQ provides at-least-once processing.

Deterministic job identifiers suppress duplicate submissions while the corresponding job remains retained.

Business processors must implement durable idempotency.

## Security

Do not include credentials, file contents, tokens, or arbitrary SQL statements in job payloads.

Workers must validate every job before processing.

Redis is not the source of truth for business records.
