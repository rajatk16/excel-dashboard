import { type CallHandler, type ExecutionContext, HttpStatus, Injectable, type NestInterceptor, StreamableFile } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import { map } from "rxjs";

import { RAW_RESPONSE_METADATA_KEY } from "../constants/http.constant";
import type { RequestContextService } from "../services/requestContext.service";
import type { ApiSuccessResponse } from "../types/apiResponse.type";

const RESPONSE_BODYLESS_STATUS_CODES = new Set<number>([
  HttpStatus.NO_CONTENT,
  HttpStatus.NOT_MODIFIED,
]);

@Injectable()
export class ResponseInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(
    private readonly reflector: Reflector,
    private readonly requestContextService: RequestContextService
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<unknown>) {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const rawResponse = this.reflector.getAllAndOverride<boolean>(
      RAW_RESPONSE_METADATA_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (rawResponse) {
      return next.handle();
    }

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    return next.handle().pipe(
      map((data): unknown => {
        if (
          response.headersSent ||
          RESPONSE_BODYLESS_STATUS_CODES.has(response.statusCode) ||
          request.method === 'HEAD' ||
          data instanceof StreamableFile
        ) {
          return data;
        }

        const result: ApiSuccessResponse<unknown> = {
          success: true,
          data: data ?? null,
          meta: {
            requestId:
              this.requestContextService.requireContext().requestId,
            timestamp: new Date().toISOString(),
          },
        };

        return result;
      })
    )
  }
}
