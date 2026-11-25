export const STORAGE_CONTENT_TYPES = {
  XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  CSV: 'text/csv',
  PARQUET: 'application/octet-stream',
  JSON: 'application/json',
  PDF: 'application/pdf',
  PNG: 'image/png',
  BINARY: 'application/octet-stream',
};

export const STORAGE_LIMITS = {
  MIN_MULTIPART_PART_SIZE: 5 * 1024 * 1024,
  MAX_MULTIPART_PART_SIZE: 5 * 1024 * 1024 * 1024,
  MAX_MULTIPART_PARTS: 10_000,
  MAX_SINGLE_PUT_SIZE: 5 * 1024 * 1024 * 1024,
  MAX_PRESIGNED_TTL_SECONDS: 604_800,
  MAX_OBJECT_KEY_BYTES: 1024,
  DEFAULT_BUFFER_LIMIT_BYTES: 16 * 1024 * 1024,
};

export const STORAGE_DEFAULTS = {
  REGION: 'us-east-1',
  MAX_ATTEMPTS: 3,
  CONNECTION_TIMEOUT_MS: 3000,
  REQUEST_TIMEOUT_MS: 30_000,
  MAX_SOCKETS: 50,
  UPLOAD_TTL_SECONDS: 900,
  DOWNLOAD_TTL_SECONDS: 300,
  MULTIPART_PART_SIZE_BYTES: 8 * 1024 * 1024,
  MULTIPART_QUEUE_SIZE: 2,
  HEALTH_TIMEOUT_MS: 5000,
};
