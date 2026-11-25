#!/bin/sh

set -eu

ENDPOINT="${S3_ENDPOINT:-http://seaweedfs:8333}"
BUCKET="${S3_BUCKET:-excel-dashboard-local}"

s3api() {
  aws \
    --endpoint-url "$ENDPOINT" \
    --no-cli-pager \
    s3api "$@"
}

echo "Waiting for object storage..."

attempt=0

until s3api list-buckets >/dev/null 2>&1; do
  attempt=$((attempt + 1))

  if [ "$attempt" -ge 60 ]; then
    echo "Object storage initialization timed out."
    exit 1
  fi

  sleep 2
done

if ! s3api head-bucket --bucket "$BUCKET" >/dev/null 2>&1; then
  echo "Creating bucket: $BUCKET"

  s3api create-bucket \
    --bucket "$BUCKET"
fi

echo "Configuring bucket CORS..."

s3api put-bucket-cors \
  --bucket "$BUCKET" \
  --cors-configuration file:///config/cors.json

echo "Object storage initialization complete."
