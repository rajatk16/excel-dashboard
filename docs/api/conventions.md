# API Conventions

## Versioning

The public application API uses URI versioning.

Current version: `/api/v1`

Infrastructure liveness and readiness endpoints are version-neutral.

## Success responses

Successful JSON responses use the following structure:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "request-id",
    "timestamp": "ISO-8601 timestamp"
  }
}
```

Controllers return domain data directly. The global response interceptor creates the response envelope.

HTTP 204 responses, streaming responses, file downloads, and explicitly marked raw responses are not wrapped.

## Error responses

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "meta": {
    "requestId": "request-id",
    "timestamp": "ISO-8601 timestamp"
  }
}
```

Validation errors may contain a `details` array with field paths, validation codes, and messages.

Clients must use error codes rather than error-message matching.

Unexpected internal errors must not expose stack traces, credentials, internal resource paths, or database details.

## Request identifiers

The API accepts valid `X-Request-Id` headers and generates a UUID when a valid identifier is not supplied.

Request identifiers are returned in response headers and JSON response metadata.

Request identifiers are for correlation, not authentication or authorization.

## Validation

Request DTOs use class-validator and class-transformer.

Unexpected properties are rejected. Nested DTOs require explicit validation and transformation configuration.

Implicit DTO property conversion is disabled.

## Pagination

Collection endpoints should use cursor-based pagination where appropriate.

Paginated data contains an `items` array and pagination metadata containing `nextCursor` and `hasNextPage`.

## Security

CORS is not an authentication or authorization mechanism.

All future tenant-owned resources must be authorized against verified workspace membership and scoped to the resolved workspace.

## Asynchronous operations

Long-running operations such as spreadsheet ingestion, analytical queries, and dashboard exports should use HTTP 202 and return an operation identifier where appropriate.

Large file uploads must use presigned object-storage URLs rather than large JSON request bodies.
