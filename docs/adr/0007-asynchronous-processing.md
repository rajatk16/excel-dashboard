# ADR 0006: Redis and BullMQ for Asynchronous Processing

## Status

Accepted for implementation.

## Context

Spreadsheet ingestion and analytical execution are expensive operations that should not run on the API request thread.

## Decision

Use BullMQ backed by Redis.

Maintain queue infrastructure in a shared workspace package.

Deploy ingestion and analytics workers independently.

Use versioned, validated job contracts.

Use deterministic job identifiers and bounded retries.

Store durable business state in PostgreSQL.

Introduce a transactional outbox before enabling durable business queues.

## Alternatives considered

- Synchronous processing in the NestJS API
- PostgreSQL-backed job queues
- RabbitMQ
- AWS SQS

## Consequences

Worker workloads can scale independently of the API.

Redis becomes a mandatory infrastructure dependency.

Jobs may be delivered multiple times.

Business idempotency and reconciliation are required.

CPU-intensive processors require execution isolation.

Production Redis must be configured without key eviction.
