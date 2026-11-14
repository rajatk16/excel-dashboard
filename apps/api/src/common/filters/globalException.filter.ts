import { randomUUID } from "node:crypto";

import { type ArgumentsHost, Catch, type ExceptionFilter,HttpException,HttpStatus, Injectable, Logger } from "@nestjs/common";
import type { Response } from "express";

import { REQUEST_ID_HEADER } from "../constants/http.constant";
import { ERROR_CODES } from "../errors/errorCodes";
import { ApplicationException } from "../exception/application.exception";
import type { RequestContextService } from "../services/requestContext.service";
import type { ApiErrorBody, ApiErrorResponse } from "../types/apiResponse.type";

interface NormalizedException {
  statusCode: number;
  error: ApiErrorBody;
}

const HTTP_ERROR_DEFAULTS: Record<number, ApiErrorBody> = {
  [HttpStatus.BAD_REQUEST]: {
    code: ERROR_CODES.BAD_REQUEST,
    message: 'The request is invalid.',
  },
  [HttpStatus.UNAUTHORIZED]: {
    code: ERROR_CODES.UNAUTHORIZED,
    message: 'Authentication is required.',
  },
  [HttpStatus.FORBIDDEN]: {
    code: ERROR_CODES.FORBIDDEN,
    message: 'You do not have permission to perform this action.',
  },
  [HttpStatus.NOT_FOUND]: {
    code: ERROR_CODES.NOT_FOUND,
    message: 'The requested resource was not found.',
  },
  [HttpStatus.METHOD_NOT_ALLOWED]: {
    code: ERROR_CODES.METHOD_NOT_ALLOWED,
    message: 'The HTTP method is not supported.',
  },
  [HttpStatus.CONFLICT]: {
    code: ERROR_CODES.CONFLICT,
    message: 'The request conflicts with the current resource state.',
  },
  [HttpStatus.GONE]: {
    code: ERROR_CODES.GONE,
    message: 'The requested resource is no longer available.',
  },
  [HttpStatus.PAYLOAD_TOO_LARGE]: {
    code: ERROR_CODES.PAYLOAD_TOO_LARGE,
    message: 'The request payload exceeds the allowed size.',
  },
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: {
    code: ERROR_CODES.UNSUPPORTED_MEDIA_TYPE,
    message: 'The request media type is not supported.',
  },
  [HttpStatus.UNPROCESSABLE_ENTITY]: {
    code: ERROR_CODES.UNPROCESSABLE_ENTITY,
    message: 'The request could not be processed.',
  },
  [HttpStatus.TOO_MANY_REQUESTS]: {
    code: ERROR_CODES.TOO_MANY_REQUESTS,
    message: 'Too many requests. Please try again later.',
  },
  [HttpStatus.INTERNAL_SERVER_ERROR]: {
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred.',
  },
  [HttpStatus.SERVICE_UNAVAILABLE]: {
    code: ERROR_CODES.SERVICE_UNAVAILABLE,
    message: 'The service is temporarily unavailable.',
  },
  [HttpStatus.GATEWAY_TIMEOUT]: {
    code: ERROR_CODES.GATEWAY_TIMEOUT,
    message: 'The operation timed out.',
  },
};

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly requestContextService: RequestContextService) {}

  catch (exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    this.handle(exception, response);
  }

  handle(exception: unknown, response: Response): void {
    const existingRequestId = response.getHeader(REQUEST_ID_HEADER);

    const requestId = this.requestContextService.getRequestId() ?? (typeof existingRequestId === 'string' ? existingRequestId : randomUUID());

    const normalized = this.normalize(exception);

    if (normalized.statusCode >= 500) {
      this.logger.error(
        `Request failed: requestId=${requestId}, status=${normalized.statusCode}, code=${normalized.error.code}`
      );
    }

    if (response.headersSent) {
      if (!response.writableEnded) {
        response.destroy();
      }
      return;
    }

    response.setHeader(REQUEST_ID_HEADER, requestId);
    response.setHeader("Cache-Control", 'no-store');

    const body: ApiErrorResponse = {
      success: false,
      error: normalized.error,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
      }
    }

    response.status(normalized.statusCode).json(body);
  }

  private normalize(exception: unknown): NormalizedException {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();

      if (
        !Number.isInteger(statusCode) ||
        statusCode < 400 || statusCode > 599
      ) {
        return this.fromStatus(HttpStatus.INTERNAL_SERVER_ERROR)
      }

      if(exception instanceof ApplicationException && statusCode < 500) {
        return {
          statusCode,
          error: {
            code: exception.code,
            message: exception.message,
            ...(exception.details !== undefined ? {details: exception.details} : {})
          }
        }
      }
      return this.fromStatus(statusCode);
    }

    const parserError = this.normalizeParserError(exception);

    if (parserError) {
      return parserError;
    }

    return this.fromStatus(
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  private normalizeParserError(
    exception:unknown
  ): NormalizedException | undefined {
    if (
      typeof exception !== 'object' || exception === null || !('type' in exception)
    ) {
      return undefined;
    }

    switch (exception.type) {
      case 'entity.parse.failed':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          error: {
            code: ERROR_CODES.INVALID_JSON,
            message: 'The request body could not be parsed.'
          }
        }
      case 'entity.too.large':
      case 'parameters.too.many':
        return this.fromStatus(HttpStatus.PAYLOAD_TOO_LARGE);

      case 'encoding.unsupported':
      case 'charset.unsupported':
        return this.fromStatus(
          HttpStatus.UNSUPPORTED_MEDIA_TYPE
        );
      case 'request.aborted':
      case 'request.size.invalid':
        return this.fromStatus(HttpStatus.BAD_REQUEST);
      default:
        return undefined;
    }
  }

  private fromStatus(statusCode: number): NormalizedException {
    const error = HTTP_ERROR_DEFAULTS[statusCode] ?? {
      code: statusCode >= 500 ? ERROR_CODES.INTERNAL_SERVER_ERROR : ERROR_CODES.HTTP_ERROR,
      message: statusCode >= 500 ? 'An unexpected error occurred.' : 'The request could not be completed.'
    }

    return {
      statusCode,
      error
    }
  }
}
