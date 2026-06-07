import { AsyncLocalStorage } from 'async_hooks';

/**
 * Per-request data carried implicitly through the call stack.
 * Populated by CorrelationIdMiddleware at the edge of every request.
 */
export interface RequestStore {
  correlationId: string;
  /** Owning tenant for the request. May be undefined until resolved. */
  brandId?: string;
}

/**
 * Single AsyncLocalStorage instance for the whole app. Anything running inside
 * a request can read the current correlation id / brandId without it being
 * threaded through every function signature.
 */
export const requestContext = new AsyncLocalStorage<RequestStore>();

export function getRequestStore(): RequestStore | undefined {
  return requestContext.getStore();
}
