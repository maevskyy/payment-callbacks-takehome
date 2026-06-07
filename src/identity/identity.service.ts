import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { SessionEntity } from '../persistence/entities/session.entity';
import { UserEntity } from '../persistence/entities/user.entity';
import { LoginResponse } from './dto/auth.response';
import { LoginDto } from './dto/login.dto';
import { ProfileResponse } from './dto/profile.response';
import { RegisterDto } from './dto/register.dto';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessions: Repository<SessionEntity>,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async register(dto: RegisterDto): Promise<ProfileResponse> {
    const email = dto.email.toLowerCase();
    const existing = await this.users.findOne({
      where: { brandId: dto.brandId, email },
    });
    if (existing) {
      throw new ConflictException('User already exists for this brand');
    }

    const user = this.users.create({
      brandId: dto.brandId,
      email,
      passwordHash: await this.passwords.hash(dto.password),
    });

    try {
      return this.toProfile(await this.users.save(user));
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('User already exists for this brand');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<LoginResponse> {
    const email = dto.email.toLowerCase();
    const user = await this.users.findOne({
      where: { brandId: dto.brandId, email },
    });
    if (!user || !(await this.passwords.verify(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.tokens.sign({
      userId: user.id,
      brandId: user.brandId,
      email: user.email,
    });

    await this.sessions.save(
      this.sessions.create({
        userId: user.id,
        token: accessToken,
        expiresAt: this.tokens.expiresAt(),
      }),
    );

    return {
      accessToken,
      expiresIn: this.tokens.getExpiresIn(),
    };
  }

  async getCurrentProfile(userId: string): Promise<ProfileResponse> {
    const brandId = this.tenantContext.requireBrandId();
    const user = await this.users.findOne({
      where: { id: userId, brandId },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    return this.toProfile(user);
  }

  private toProfile(user: UserEntity): ProfileResponse {
    return {
      id: user.id,
      brandId: user.brandId,
      email: user.email,
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === '23505'
    );
  }
}
