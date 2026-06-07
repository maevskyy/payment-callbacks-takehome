import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, InsertResult } from 'typeorm';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { IdempotencyKeyEntity } from '../persistence/entities/idempotency-key.entity';
import { RawEventEntity } from '../persistence/entities/raw-event.entity';
import { CallbackKind } from './callback-kind';
import { CallbackResponse } from './dto/callback-response';

interface ReceiveCallbackInput {
  kind: CallbackKind;
  provider: string;
  payload: Record<string, unknown>;
  idempotencyKey?: string;
}

@Injectable()
export class CallbacksService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContextService,
  ) {}

  async receive(input: ReceiveCallbackInput): Promise<CallbackResponse> {
    this.validatePayload(input.payload);
    const brandId = this.getRequiredBrandId();
    const eventId = this.deriveEventId(input.payload, input.idempotencyKey);
    const key = `${input.kind}:${input.provider}:${eventId}`;

    const inserted = await this.dataSource.transaction((manager) =>
      this.persistIfNew(manager, {
        ...input,
        brandId,
        eventId,
        key,
      }),
    );

    return {
      status: inserted ? 'accepted' : 'duplicate',
      eventId,
    };
  }

  private async persistIfNew(
    manager: EntityManager,
    input: ReceiveCallbackInput & {
      brandId: string;
      eventId: string;
      key: string;
    },
  ): Promise<boolean> {
    const insertResult = await manager
      .createQueryBuilder()
      .insert()
      .into(IdempotencyKeyEntity)
      .values({ brandId: input.brandId, key: input.key })
      .orIgnore()
      .returning('id')
      .execute();

    if (!this.wasInserted(insertResult)) {
      return false;
    }

    await manager.save(
      manager.create(RawEventEntity, {
        brandId: input.brandId,
        kind: input.kind,
        provider: input.provider,
        payload: input.payload,
      }),
    );

    return true;
  }

  private deriveEventId(
    payload: Record<string, unknown>,
    idempotencyKey?: string,
  ): string {
    const headerKey = idempotencyKey?.trim();
    if (headerKey) {
      return headerKey;
    }

    const eventId = payload.eventId;
    if (typeof eventId === 'string' && eventId.trim().length > 0) {
      return eventId.trim();
    }

    throw new UnprocessableEntityException(
      'Webhook payload must include eventId or Idempotency-Key header',
    );
  }

  private validatePayload(payload: unknown): asserts payload is Record<string, unknown> {
    if (
      typeof payload !== 'object' ||
      payload === null ||
      Array.isArray(payload)
    ) {
      throw new UnprocessableEntityException('Webhook payload must be a JSON object');
    }
  }

  private getRequiredBrandId(): string {
    const brandId = this.tenantContext.getBrandId();
    if (!brandId) {
      throw new BadRequestException('X-Brand-Id header is required');
    }

    return brandId;
  }

  private wasInserted(result: InsertResult): boolean {
    return Array.isArray(result.raw) && result.raw.length > 0;
  }
}
