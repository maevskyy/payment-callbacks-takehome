import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from './authenticated-request';
import { LoginResponse } from './dto/auth.response';
import { LoginDto } from './dto/login.dto';
import { ProfileResponse } from './dto/profile.response';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from './auth.guard';
import { IdentityService } from './identity.service';

@Controller()
@ApiTags('identity')
export class IdentityController {
  constructor(private readonly identity: IdentityService) {}

  @Post('auth/register')
  @ApiCreatedResponse({ type: ProfileResponse })
  @ApiConflictResponse({ description: 'User already exists for this brand' })
  register(@Body() dto: RegisterDto): Promise<ProfileResponse> {
    return this.identity.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  @ApiOkResponse({ type: LoginResponse })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto): Promise<LoginResponse> {
    return this.identity.login(dto);
  }

  @UseGuards(AuthGuard)
  @Get('profile/me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: ProfileResponse })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  me(@Req() request: AuthenticatedRequest): Promise<ProfileResponse> {
    return this.identity.getCurrentProfile(request.user.sub);
  }
}
