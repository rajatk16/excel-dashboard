import { HttpException } from "@nestjs/common";

import type { ApiErrorBody, ApiErrorDetail } from "../types/apiResponse.type";

export interface ApplicationExceptionOptions {
  statusCode: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  cause?: unknown;
}

export class ApplicationException extends HttpException {
  readonly code: string;

  readonly details: ApiErrorDetail[] | undefined;

  constructor(options: ApplicationExceptionOptions) {
    const response: ApiErrorBody = {
      code: options.code,
      message: options.message,
      ...(options.details !== undefined ? {
        details: options.details
      } : {})
    }

    super(response, options.statusCode, {
      cause: options.cause
    })

    this.code = options.code;
    this.details = options.details;
  }
}
