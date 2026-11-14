
import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Response } from "express";

import { REQUEST_ID_HEADER } from "../constants/http.constant";

export const RequestId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const response = context.switchToHttp().getResponse<Response>();

    const requestId = response.getHeader(REQUEST_ID_HEADER);

    if (typeof requestId !== 'string') {
      throw new Error('Request ID has not been initialized');
    }

    return requestId;
  }
)
