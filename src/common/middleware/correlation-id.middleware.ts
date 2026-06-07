import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requestContext, RequestStore } from '../context/request-context';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const BRAND_ID_HEADER = 'x-brand-id';

/**
 * Edge middleware: establishes the request context for every incoming request.
 *
 * - Reads `X-Correlation-Id` or generates one, echoes it back on the response,
 *   and stores it so all logs for this request can include it.
 * - Seeds `brandId` from the `X-Brand-Id` header when present (webhooks).
 *   Identity routes overwrite this from the JWT in a later task.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header(CORRELATION_ID_HEADER);
    const correlationId =
      incoming && incoming.trim().length > 0 ? incoming.trim() : `req_${uuidv4()}`;

    const brandHeader = req.header(BRAND_ID_HEADER);

    res.setHeader(CORRELATION_ID_HEADER, correlationId);

    const store: RequestStore = {
      correlationId,
      brandId: brandHeader && brandHeader.trim().length > 0 ? brandHeader.trim() : undefined,
    };

    requestContext.run(store, () => next());
  }
}
