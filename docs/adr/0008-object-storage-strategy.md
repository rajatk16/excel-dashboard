# ADR 0008 — S3-compatible Object Storage

**Status:** Proposed, pending compatibility verification

## Context

Excel Dashboard requires durable storage for original spreadsheet files, normalized Parquet datasets, dataset metadata, query artifacts and generated exports.

Storing large binary files in PostgreSQL or Redis would increase infrastructure costs and complicate scaling.

The application also requires direct browser uploads, streaming downloads and asynchronous worker access.

## Decision

Use S3-compatible object storage through AWS SDK for JavaScript v3.

Use SeaweedFS for local development and integration testing. Use AWS S3 for staging and production.

Introduce a shared server-only storage package consumed by the API and background workers.

Use one private application bucket per environment, with workspace-scoped object prefixes based on immutable identifiers.

Use presigned URLs for authorized browser transfers and multipart uploads for large server-side artifacts.

## Consequences

### Positive

- Large binary objects remain outside PostgreSQL and Redis.
- Browser uploads do not consume API bandwidth.
- API and workers share a consistent storage abstraction.
- Local development does not require an AWS account.
- Dataset versions can reference immutable storage artifacts.

### Trade-offs

- PostgreSQL and object storage cannot share a transaction.
- Orphaned artifacts require reconciliation.
- S3-compatible providers may differ in feature behavior.
- Presigned URLs require careful authorization and expiration policies.
- Integration tests and AWS deployment smoke tests are required.

## Alternatives

Local filesystem storage was rejected because it complicates horizontal scaling and distributed workers.

Database binary storage was rejected because of its operational and scaling implications.

MinIO was excluded from the local infrastructure.

## Verification

The decision becomes accepted after the selected SeaweedFS version passes the storage compatibility suite and the AWS staging environment passes deployment smoke tests.
