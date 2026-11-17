# Asynchronous Processing Architecture

Excel Dashboard uses Redis and BullMQ for asynchronous background processing.

## Applications

The NestJS API submits jobs.

The ingestion worker processes spreadsheet-related workloads.

The analytics worker processes analytical workloads.

## Shared infrastructure

All queue contracts, connection management, retry policies, producer and consumer utilities are maintained in @excel-dashboard/queue.

## Delivery semantics

Jobs may be delivered more than once.

Processors must be idempotent.

Queue-level deduplication is not equivalent to durable business idempotency.

## Business state

PostgreSQL is the authoritative source of business state.

Redis stores operational queue state.

Durable business dispatch will use a transactional outbox.

## Retry strategy

Transient failures use bounded exponential backoff.

Permanent failures must not be automatically retried.

## Lifecycle

Workers stop accepting new jobs during graceful shutdown.

Active jobs are drained before Redis connections are closed.

Interrupted jobs must be recoverable through stalled-job recovery and durable idempotency.

## Security

Job payloads contain identifiers rather than sensitive data.

Tenant-owned business records must be resolved using verified workspace context.

Production Redis requires authentication, TLS, private networking, persistence and noeviction.
