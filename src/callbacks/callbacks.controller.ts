import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiHeader,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { CallbackKind } from './callback-kind';
import { CallbackResponse } from './dto/callback-response';
import { WebhookPayloadDto } from './dto/webhook-payload.dto';
import { CallbacksService } from './callbacks.service';

@Controller('webhooks')
@ApiTags('callbacks')
export class CallbacksController {
  constructor(private readonly callbacks: CallbacksService) {}

  @HttpCode(HttpStatus.OK)
  @Post('psp/:provider')
  @ApiParam({ name: 'provider', example: 'stripe' })
  @ApiHeader({ name: 'X-Brand-Id', example: 'brand-a' })
  @ApiHeader({
    name: 'Idempotency-Key',
    example: 'evt_abc_123',
    required: false,
  })
  @ApiBody({ type: WebhookPayloadDto })
  @ApiOkResponse({ type: CallbackResponse })
  @ApiBadRequestResponse({ description: 'Missing tenant header' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid webhook payload' })
  receivePsp(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Req() request: Request,
  ): Promise<CallbackResponse> {
    return this.receive('psp', provider, payload, this.idempotencyKey(request));
  }

  @HttpCode(HttpStatus.OK)
  @Post('gsp/:provider')
  @ApiParam({ name: 'provider', example: 'acme' })
  @ApiHeader({ name: 'X-Brand-Id', example: 'brand-a' })
  @ApiHeader({
    name: 'Idempotency-Key',
    example: 'evt_xyz_789',
    required: false,
  })
  @ApiBody({ type: WebhookPayloadDto })
  @ApiOkResponse({ type: CallbackResponse })
  @ApiBadRequestResponse({ description: 'Missing tenant header' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid webhook payload' })
  receiveGsp(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Req() request: Request,
  ): Promise<CallbackResponse> {
    return this.receive('gsp', provider, payload, this.idempotencyKey(request));
  }

  private receive(
    kind: CallbackKind,
    provider: string,
    payload: Record<string, unknown>,
    idempotencyKey?: string,
  ): Promise<CallbackResponse> {
    return this.callbacks.receive({
      kind,
      provider,
      payload,
      idempotencyKey,
    });
  }

  private idempotencyKey(request: Request): string | undefined {
    return request.header('idempotency-key');
  }
}
