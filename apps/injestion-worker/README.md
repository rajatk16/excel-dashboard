# Ingestion Worker

Processes uploaded spreadsheet files asynchronously.

## Responsibilities

- Workbook inspection
- Worksheet extraction
- Header detection
- Schema inference
- Data normalization
- Parquet generation
- Dataset profiling
- Import progress reporting

## Technology

- Node.js
- TypeScript
- BullMQ
- Redis
- Spreadsheet parsing libraries
- DuckDB
- S3-compatible object storage

## Implementation Status

The application workspace is registered.

The ingestion worker will be implemented in Phase 4.
