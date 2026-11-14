import type { NestExpressApplication } from "@nestjs/platform-express";
import express, { type ErrorRequestHandler, type NextFunction, Request, Response } from 'express';

import { GlobalExceptionFilter } from "../common/filters/globalException.filter";
import { AppConfigService } from "../config/services/appConfig.service";

export const configureBodyParser = (
  app: NestExpressApplication
): void => {
  const config = app.get(AppConfigService);

  const exceptionFilter = app.get(GlobalExceptionFilter);

  app.use(
    express.json({
      limit: config.get('JSON_BODY_LIMIT_BYTES'),
      strict: true,
      inflate: false,
      type: [
        'application/json',
        'application/**json'
      ],
    })
  );

  app.use(
    express.urlencoded({
      extended: false,
      inflate: false,
      limit: config.get('FORM_BODY_LIMIT_BYTES'),
      parameterLimit: config.get('FORM_PARAMETER_LIMIT')
    })
  );

  const parserErrorHandler: ErrorRequestHandler = (
    error: unknown,
    _request: Request,
    response: Response,
    next: NextFunction
  ): void => {
    if (response.headersSent) {
      next(error);
      return;
    }
    exceptionFilter.handle(error, response);
  }
  app.use(parserErrorHandler);
}
