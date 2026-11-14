import { Logger, type LogLevel } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { configureApplication } from "./bootstrap/configureApplication";
import { AppConfigService } from "./config/services/appConfig.service";
import { HealthService } from "./health/services/health.service";
import { AppModule } from "./app.module";

const logger = new Logger('Bootstrap');

const configureLogger = (app: NestExpressApplication, config: AppConfigService): void => {
  const levels: Record<string, LogLevel[] | false> = {
    fatal: ['fatal'],
    error: ['fatal', 'error'],
    warn: ['fatal', 'error', 'warn'],
    info: ['fatal', 'error', 'warn', 'log'],
    debug: ['fatal', 'error', 'warn', 'log', 'debug'],
    trace: [
      'fatal',
      'error',
      'warn',
      'log',
      'debug',
      'verbose'
    ],
    silent: false
  };

  app.useLogger(
    levels[config.get('LOG_LEVEL')] ?? [
      'fatal',
      'error',
      'warn',
      'log'
    ]
  )
}

const configureHttpServer = (
  app: NestExpressApplication,
  config: AppConfigService
): void => {
  const server = app.getHttpServer();

  server.requestTimeout = config.get('HTTP_HEADERS_TIMEOUT_MS');

  server.keepAliveTimeout = config.get('HTTP_KEEP_ALIVE_TIMEOUT_MS');

  server.maxHeadersCount = 100;
}


const registerShutdownHandlers = (
  app: NestExpressApplication,
  config: AppConfigService
): void => {
  const healthService = app.get(HealthService);

  let shuttingDown = false;

  const shutdown = async (
    signal: NodeJS.Signals
  ): Promise<void> => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    healthService.markNotReady();

    logger.log(`Received ${signal}; shutting down.`);

    const timeout = setTimeout(() => {
      logger.error("Graceful shutdown deadline exceeded");
      const server = app.getHttpServer();

      server.closeAllConnections();

      process.exit(1);
    }, config.get('SHUTDOWN_TIMEOUT_MS'));

    timeout.unref();

    try {
      await app.close();

      clearTimeout(timeout);

      logger.log('Application shutdown completed.')
    } catch {
      clearTimeout(timeout);

      logger.error('Application shutdown failed.');

      process.exit(1);
    }
  }

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  })

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  })
}

const bootstrap = async () => {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    {
      bodyParser: false,
      abortOnError: false
    }
  );

  try {
    const config = app.get(AppConfigService);

    configureLogger(app, config);

    configureApplication(app);

    configureHttpServer(app, config);

    registerShutdownHandlers(app, config);

    await app.listen(config.port, config.host);

    logger.log(
      `${config.applicationName} is listening on ${config.host}:${config.port}`
    );

    logger.log('Versioned API prefix: /api/v1');
  } catch (error) {
    await app.close().catch(() => undefined);

    throw error;
  }
}

void bootstrap().catch(() => {
  logger.error('API startup failed. Check application configuration and startup logs.');

  process.exitCode = 1;
})
