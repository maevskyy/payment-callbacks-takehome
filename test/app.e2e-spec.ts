import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

interface JsonResponse<T> {
  status: number;
  body: T;
  headers: Headers;
}

interface CallbackBody {
  status: 'accepted' | 'duplicate';
  eventId: string;
}

interface ProfileBody {
  id: string;
  brandId: string;
  email: string;
}

interface LoginBody {
  accessToken: string;
  expiresIn: string;
}

describe('App e2e', () => {
  let appUrl: string;
  let app: INestApplication;
  let moduleRef: TestingModule;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.DATABASE_URL ??= 'postgres://user:pass@localhost:5432/app';
    process.env.JWT_SECRET ??= 'test-secret';
    process.env.JWT_EXPIRES_IN ??= '1h';

    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    await app.listen(0);

    const address = app.getHttpServer().address();
    if (typeof address === 'string' || !address) {
      throw new Error('Unexpected test server address');
    }

    appUrl = `http://127.0.0.1:${address.port}`;
    dataSource = moduleRef.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE raw_events, idempotency_keys, sessions, users RESTART IDENTITY CASCADE',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('deduplicates repeated callbacks and stores one raw event', async () => {
    const payload = {
      eventId: 'evt_duplicate_1',
      type: 'payment.succeeded',
      amount: 1000,
    };

    const first = await post<CallbackBody>('/webhooks/psp/stripe', payload, {
      'X-Brand-Id': 'brand-a',
      'Idempotency-Key': 'evt_duplicate_1',
    });
    const second = await post<CallbackBody>('/webhooks/psp/stripe', payload, {
      'X-Brand-Id': 'brand-a',
      'Idempotency-Key': 'evt_duplicate_1',
    });

    expect(first.status).toBe(200);
    expect(first.body).toEqual({ status: 'accepted', eventId: 'evt_duplicate_1' });
    expect(second.status).toBe(200);
    expect(second.body).toEqual({ status: 'duplicate', eventId: 'evt_duplicate_1' });

    const [{ count }] = await dataSource.query(
      'SELECT COUNT(*)::int AS count FROM raw_events WHERE "brandId" = $1 AND provider = $2',
      ['brand-a', 'stripe'],
    );
    expect(count).toBe(1);
  });

  it('keeps same callback key isolated between brands', async () => {
    const payload = { eventId: 'evt_shared', type: 'settlement.completed' };

    await post<CallbackBody>('/webhooks/gsp/acme', payload, {
      'X-Brand-Id': 'brand-a',
    });
    const brandB = await post<CallbackBody>('/webhooks/gsp/acme', payload, {
      'X-Brand-Id': 'brand-b',
    });

    expect(brandB.body).toEqual({ status: 'accepted', eventId: 'evt_shared' });

    const [{ count }] = await dataSource.query(
      "SELECT COUNT(*)::int AS count FROM raw_events WHERE provider = 'acme'",
    );
    expect(count).toBe(2);
  });

  it('resolves profile within the token brand only', async () => {
    const email = 'same-user@example.com';
    const brandA = await post<ProfileBody>('/auth/register', {
      brandId: 'brand-a',
      email,
      password: 'secret123',
    });
    const brandB = await post<ProfileBody>('/auth/register', {
      brandId: 'brand-b',
      email,
      password: 'secret123',
    });
    const login = await post<LoginBody>('/auth/login', {
      brandId: 'brand-a',
      email,
      password: 'secret123',
    });

    const profile = await get<ProfileBody>('/profile/me', {
      Authorization: `Bearer ${login.body.accessToken}`,
    });

    expect(profile.status).toBe(200);
    expect(profile.body).toEqual(brandA.body);
    expect(profile.body.id).not.toBe(brandB.body.id);
    expect(profile.body.brandId).toBe('brand-a');
  });

  async function post<T>(
    path: string,
    body: unknown,
    headers: Record<string, string> = {},
  ): Promise<JsonResponse<T>> {
    return request<T>(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    });
  }

  async function get<T>(
    path: string,
    headers: Record<string, string> = {},
  ): Promise<JsonResponse<T>> {
    return request<T>(path, {
      method: 'GET',
      headers,
    });
  }

  async function request<T>(
    path: string,
    init: RequestInit,
  ): Promise<JsonResponse<T>> {
    const response = await fetch(`${appUrl}${path}`, init);
    return {
      status: response.status,
      body: (await response.json()) as T,
      headers: response.headers,
    };
  }
});
