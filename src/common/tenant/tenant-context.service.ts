import { Injectable } from '@nestjs/common';
import { getRequestStore } from '../context/request-context';

/**
 * Read/write access to the current request's tenant (`brandId`).
 *
 * The persistence layer reads `requireBrandId()` to scope every query, which is
 * what enforces tenant isolation. Identity guards call `setBrandId()` to bind
 * the tenant resolved from the JWT.
 */
@Injectable()
export class TenantContextService {
  getBrandId(): string | undefined {
    return getRequestStore()?.brandId;
  }

  setBrandId(brandId: string): void {
    const store = getRequestStore();
    if (store) {
      store.brandId = brandId;
    }
  }

  /** Returns the brandId or throws — use where a tenant is mandatory. */
  requireBrandId(): string {
    const brandId = this.getBrandId();
    if (!brandId) {
      throw new Error('Tenant context (brandId) is not set for this request');
    }
    return brandId;
  }
}
