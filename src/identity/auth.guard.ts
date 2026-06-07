import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { MoreThan, Repository } from 'typeorm';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { SessionEntity } from '../persistence/entities/session.entity';
import { AuthenticatedRequest } from './authenticated-request';
import { TokenService } from './token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly tenantContext: TenantContextService,
    @InjectRepository(SessionEntity)
    private readonly sessions: Repository<SessionEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearerToken(request);
    const payload = this.tokenService.verify(token);
    const session = await this.sessions.findOne({
      where: {
        userId: payload.sub,
        token,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    this.tenantContext.setBrandId(payload.brandId);
    (request as AuthenticatedRequest).user = payload;

    return true;
  }

  private extractBearerToken(request: Request): string {
    const header = request.header('authorization');
    if (!header) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    return token;
  }
}
