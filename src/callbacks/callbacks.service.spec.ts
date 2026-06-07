/// <reference types="jest" />

import { UnprocessableEntityException } from '@nestjs/common';
import { CallbacksService } from './callbacks.service';

function createService(options: { inserted: boolean; brandId?: string }) {
  const save = jest.fn();
  const execute = jest.fn().mockResolvedValue({
    raw: options.inserted ? [{ id: 'idem_1' }] : [],
  });
  const queryBuilder = {
    insert: jest.fn().mockReturnThis(),
    into: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    orIgnore: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    execute,
  };
  const manager = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    create: jest.fn((_entity, value) => value),
    save,
  };
  const dataSource = {
    transaction: jest.fn((callback) => callback(manager)),
  };
  const tenantContext = {
    getBrandId: jest.fn(() => options.brandId ?? 'brand-a'),
  };

  return {
    service: new CallbacksService(dataSource as never, tenantContext as never),
    dataSource,
    manager,
    queryBuilder,
    save,
  };
}

describe('CallbacksService', () => {
  it('stores a raw event when the idempotency key is new', async () => {
    const { service, save } = createService({ inserted: true });

    await expect(
      service.receive({
        kind: 'psp',
        provider: 'stripe',
        payload: { eventId: 'evt_1', type: 'payment.succeeded' },
      }),
    ).resolves.toEqual({ status: 'accepted', eventId: 'evt_1' });

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        brandId: 'brand-a',
        kind: 'psp',
        provider: 'stripe',
        payload: expect.objectContaining({ eventId: 'evt_1' }),
      }),
    );
  });

  it('does not store a raw event when the idempotency key already exists', async () => {
    const { service, save } = createService({ inserted: false });

    await expect(
      service.receive({
        kind: 'gsp',
        provider: 'acme',
        payload: { eventId: 'evt_1', type: 'settlement.completed' },
      }),
    ).resolves.toEqual({ status: 'duplicate', eventId: 'evt_1' });

    expect(save).not.toHaveBeenCalled();
  });

  it('rejects malformed callback payloads', async () => {
    const { service } = createService({ inserted: true });

    await expect(
      service.receive({
        kind: 'psp',
        provider: 'stripe',
        payload: {} as Record<string, unknown>,
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
