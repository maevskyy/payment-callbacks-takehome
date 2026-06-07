import { Request } from 'express';

export interface AuthTokenPayload {
  sub: string;
  brandId: string;
  email: string;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user: AuthTokenPayload;
}
