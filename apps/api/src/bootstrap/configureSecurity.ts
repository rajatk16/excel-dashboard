import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";

import { REQUEST_ID_HEADER } from "../common/constants/http.constant";
import { AppConfigService } from "../config/services/appConfig.service";

export const configureSecurity = (
  app: NestExpressApplication
): void => {
  const config = app.get(AppConfigService);

  app.disable('x-powered-by');

  app.set(
    'trust proxy',
    config.trustProxyHops === 0 ? false : config.trustProxyHops
  );

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
        }
      },
      strictTransportSecurity: config.isProduction ? {
        maxAge: 31536000,
        includeSubDomains: false,
        preload: false
      }: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'same-origin',
      },
      referrerPolicy: {
        policy: 'no-referrer'
      }
    })
  );

  const allowedOrigins = new Set(config.corsOrigins);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      callback(null, allowedOrigins.has(origin));
    },
    credentials: config.corsCredentials,
    methods: [
      'GET',
      'HEAD',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      REQUEST_ID_HEADER,
      'Idempotency-Key',
      'If-Match',
      'If-None-Match'
    ],
    exposedHeaders: [
      REQUEST_ID_HEADER,
      'Location',
      'ETag',
      "Retry-After"
    ],
    maxAge: 600,
    optionsSuccessStatus: 204
  })
}
