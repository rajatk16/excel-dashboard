import { HttpStatus, ValidationPipe } from "@nestjs/common";

import { ERROR_CODES } from "../errors/errorCodes";
import { ApplicationException } from "../exception/application.exception";
import { flattenValidationErrors } from "../utils/validationErrors";

export const createGlobalValidationPipe = (): ValidationPipe => new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  stopAtFirstError: false,
  transformOptions: {
    enableImplicitConversion: false
  },
  validationError: {
    target: false,
    value: false
  },
  exceptionFactory: (errors) => new ApplicationException({
    statusCode: HttpStatus.BAD_REQUEST,
    code: ERROR_CODES.VALIDATION_ERROR,
    message: 'Request validation failed.',
    details: flattenValidationErrors(errors)
  })
})
