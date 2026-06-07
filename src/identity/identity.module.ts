import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { AuthGuard } from './auth.guard';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

@Module({
  imports: [PersistenceModule],
  controllers: [IdentityController],
  providers: [AuthGuard, IdentityService, PasswordService, TokenService],
})
export class IdentityModule {}
