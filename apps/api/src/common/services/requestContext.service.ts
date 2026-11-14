import { AsyncLocalStorage } from "node:async_hooks";

import { Injectable } from "@nestjs/common";

import { RequestContext } from "../types/requestContext.type";

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  run<T>(context: RequestContext, callback: () => T): T {
    return this.storage.run(Object.freeze(context), callback);
  }

  getContext(): RequestContext | undefined {
    return this.storage.getStore();
  }

  requireContext(): RequestContext {
    const context = this.getContext();

    if (!context) {
      throw new Error('Request context is not available.');
    }

    return context;
  }

  getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }

  getElapsedTime(): number | undefined {
    const context = this.getContext();

    if (!context) {
      return undefined;
    }

    return performance.now() - context.startedAt;
  }
}
