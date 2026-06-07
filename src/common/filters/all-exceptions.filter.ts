import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { getRequestStore } from '../context/request-context';

interface StructuredError {
  statusCode: number;
  error: string;
  message: string;
  correlationId: string;
}

/**
 * Global exception filter. Turns every thrown error into the single structured
 * shape documented in docs/API.md#error-format, always carrying the request's
 * correlation id. This is the only place that formats error responses.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const correlationId = getRequestStore()?.correlationId ?? 'unknown';

    const status = this.resolveStatus(exception);
    const { error, message } = this.resolveMessage(exception, status);

    const body: StructuredError = { statusCode: status, error, message, correlationId };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${correlationId}] ${message}`, this.stack(exception));
    } else {
      this.logger.warn(`[${correlationId}] ${status} ${error}: ${message}`);
    }

    response.status(status).json(body);
  }

  private resolveStatus(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private resolveMessage(
    exception: unknown,
    status: number,
  ): { error: string; message: string } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const error =
        typeof res === 'object' && res !== null && 'error' in res
          ? String((res as Record<string, unknown>).error)
          : exception.name.replace(/Exception$/, '');
      const message =
        typeof res === 'string'
          ? res
          : typeof res === 'object' && res !== null && 'message' in res
            ? this.flatten((res as Record<string, unknown>).message)
            : exception.message;
      return { error, message };
    }
    return {
      error: 'Internal Server Error',
      message: status >= 500 ? 'Internal server error' : 'Unexpected error',
    };
  }

  private flatten(message: unknown): string {
    return Array.isArray(message) ? message.join('; ') : String(message);
  }

  private stack(exception: unknown): string | undefined {
    return exception instanceof Error ? exception.stack : undefined;
  }
}
