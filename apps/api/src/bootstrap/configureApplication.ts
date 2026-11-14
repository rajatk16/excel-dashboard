import { RequestMethod, VersioningType } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { API_PREFIX, DEFAULT_API_VERSION } from "../common/constants/http.constant";
import { GlobalExceptionFilter } from "../common/filters/globalException.filter";
import { ResponseInterceptor } from "../common/interceptors/response.interceptor";
import { RequestContextMiddleware } from "../common/middlewares/requestContext.middleware";
import { createGlobalValidationPipe } from "../common/pipes/validation.pipe";

import { configureBodyParser } from "./configureBodyParser";
import { configureSecurity } from "./configureSecurity";

export const configureApplication = (app: NestExpressApplication): void => {
  const requestContextMiddleware = app.get(RequestContextMiddleware);

  app.use(
    requestContextMiddleware.use.bind(requestContextMiddleware)
  );

  configureSecurity(app);

  configureBodyParser(app);

  app.setGlobalPrefix(API_PREFIX, {
    exclude: [
      {
        path: 'health/live',
        method: RequestMethod.GET
      },
      {
        path: 'health/ready',
        method: RequestMethod.GET
      }
    ]
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_API_VERSION
  });


  app.useGlobalPipes(createGlobalValidationPipe());

  app.useGlobalFilters(
    app.get(GlobalExceptionFilter)
  );

  app.useGlobalInterceptors(
    app.get(ResponseInterceptor)
  )
}
