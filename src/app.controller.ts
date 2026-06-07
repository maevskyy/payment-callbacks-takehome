import { Controller, Get, InternalServerErrorException, Query } from '@nestjs/common';
import { getRequestStore } from './common/context/request-context';

/**
 * Minimal endpoints to verify the cross-cutting layer (Task 1 acceptance).
 * Feature routes arrive in later tasks.
 */
@Controller()
export class AppController {
  @Get('health')
  health(): { status: string; correlationId: string } {
    return {
      status: 'ok',
      correlationId: getRequestStore()?.correlationId ?? 'unknown',
    };
  }

  /** Dev-only: forces a thrown error to confirm the structured error shape. */
  @Get('debug/boom')
  boom(@Query('kind') kind?: string): never {
    throw new InternalServerErrorException(kind ? `boom: ${kind}` : 'boom');
  }
}
