# Object Storage Architecture

## Overview

Excel Dashboard uses object storage for binary and generated artifacts. PostgreSQL remains the authoritative source for ownership, processing state, dataset versions and object references.

Redis and BullMQ coordinate asynchronous processing but do not store file contents.

## Storage providers

SeaweedFS is used locally and in integration tests. AWS S3 is used in staging and production.

## Object organization

Objects are organized beneath workspaces/{workspaceId}/ using immutable UUID identifiers.

Original spreadsheet files, dataset versions, query results, exports and temporary artifacts use separate prefixes.

## Application integration

The NestJS API imports StorageModule and injects the shared object storage service.

The ingestion and analytics workers create one storage runtime during bootstrap and close it during graceful shutdown.

## Data consistency

Object storage writes are not transactional with PostgreSQL.

Dataset artifacts must be written and verified before the corresponding dataset version is committed as ready.

Failed jobs must preserve the previously active dataset version. Orphaned artifacts are handled by reconciliation and cleanup workflows.

## Security

Buckets are private. Browser access uses short-lived presigned URLs issued only after authorization.

Production uses IAM roles, encrypted transport, bucket encryption and restricted permissions.

Object keys must never be derived directly from user-supplied filenames.

## Health monitoring

Storage readiness is checked using a bounded HeadBucket operation.

Storage availability affects application readiness, not process liveness.

## Limitations

Provider compatibility must be verified for multipart uploads, presigned requests, CORS, metadata operations and deletion semantics.

Application-level file validation, quota enforcement, upload finalization and cleanup workflows are implemented during the ingestion phase.
