import { randomUUID } from "node:crypto";

import { Injectable, type NestMiddleware } from "@nestjs/common";
import type {NextFunction,Request, Response} from 'express';

import { MAX_REQUEST_ID_LENGTH, REQUEST_ID_HEADER, REQUEST_ID_PATTERN } from "../constants/http.constant";
import type { RequestContextService } from "../services/requestContext.service";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContextService: RequestContextService
  ) {}

  use(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    const requestId = this.resolveRequestId(request);

    response.setHeader(REQUEST_ID_HEADER, requestId);

    this.requestContextService.run(
      {
        requestId,
        startedAt: performance.now(),
        method: request.method
      },
      next
    );
  }

  private resolveRequestId(request: Request): string {
    const suppliedId = request.headers[REQUEST_ID_HEADER];

    if (
      typeof suppliedId === 'string' &&
      suppliedId.length > 0 &&
      suppliedId.length <= MAX_REQUEST_ID_LENGTH &&
      REQUEST_ID_PATTERN.test(suppliedId)
    ) {
      return suppliedId;
    }

    return randomUUID();
  }
}
