# Queue Development Workflow

## Start Redis

```bash
npm run redis:up
```

## Start workers

```bash
npm run dev:ingestion
npm run dev:analytics
```

## Inspect queue statistics

```bash
npm run queue:admin -- stats
```

## Submit an infrastructure probe

Set QUEUE_ADMIN_ALLOW_MUTATIONS=true in packages/queue/.env.

```bash
npm run queue:admin -- probe ingestion-probe
npm run queue:admin -- probe analytics-probe
```

Restore QUEUE_ADMIN_ALLOW_MUTATIONS=false afterwards.

## Inspect failed jobs

```bash
npm run queue:admin -- failed ingestion-probe
```

## Retry a failed probe

After verifying the failure is safe to retry:

```bash
npm run queue:admin -- retry ingestion-probe JOB_ID
```

## Run tests

```bash
npm run test:queue
npm run test:queue:integration
```

Integration tests require Docker.

## Stop Redis

```bash
npm run redis:down
```

The named Redis volume is preserved.
