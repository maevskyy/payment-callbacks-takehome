import { Global, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { TenantContextService } from './tenant/tenant-context.service';

/**
 * Cross-cutting concerns shared by every feature module: the global structured
 * error filter and the request-scoped tenant context. Global so other modules
 * can inject TenantContextService without re-importing.
 */
@Global()
@Module({
  providers: [
    TenantContextService,
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
  exports: [TenantContextService],
})
export class CommonModule {}
