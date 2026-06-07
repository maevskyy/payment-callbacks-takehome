import { createHmac } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenPayload } from './authenticated-request';

interface SignInput {
  userId: string;
  brandId: string;
  email: string;
}

@Injectable()
export class TokenService {
  constructor(private readonly config: ConfigService) {}

  sign(input: SignInput): string {
    const expiresIn = this.getExpiresIn();
    const now = Math.floor(Date.now() / 1000);
    const payload: AuthTokenPayload = {
      sub: input.userId,
      brandId: input.brandId,
      email: input.email,
      exp: now + this.toSeconds(expiresIn),
    };

    return this.encode({ alg: 'HS256', typ: 'JWT' }, payload);
  }

  verify(token: string): AuthTokenPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Invalid token');
    }

    const expected = this.signPart(`${encodedHeader}.${encodedPayload}`);
    if (signature !== expected) {
      throw new UnauthorizedException('Invalid token');
    }

    const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as AuthTokenPayload;
    if (!payload.sub || !payload.brandId || !payload.email || !payload.exp) {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  getExpiresIn(): string {
    return this.config.get<string>('JWT_EXPIRES_IN') ?? '1h';
  }

  expiresAt(): Date {
    return new Date(Date.now() + this.toSeconds(this.getExpiresIn()) * 1000);
  }

  private encode(header: object, payload: object): string {
    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.signPart(`${encodedHeader}.${encodedPayload}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private signPart(value: string): string {
    return createHmac('sha256', this.getSecret()).update(value).digest('base64url');
  }

  private getSecret(): string {
    const secret = this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    return secret;
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private base64UrlDecode(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
  }

  private toSeconds(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Unsupported JWT_EXPIRES_IN value: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return amount * multipliers[unit];
  }
}
