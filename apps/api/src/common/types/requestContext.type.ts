export interface RequestContext {
  readonly requestId: string;
  readonly startedAt: number;
  readonly method: string;
}
