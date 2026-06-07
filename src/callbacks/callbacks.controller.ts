import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CallbackKind } from './callback-kind';
import { CallbackResponse } from './dto/callback-response';
import { CallbacksService } from './callbacks.service';

@Controller('webhooks')
export class CallbacksController {
  constructor(private readonly callbacks: CallbacksService) {}

  @HttpCode(HttpStatus.OK)
  @Post('psp/:provider')
  receivePsp(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<CallbackResponse> {
    return this.receive('psp', provider, payload, idempotencyKey);
  }

  @HttpCode(HttpStatus.OK)
  @Post('gsp/:provider')
  receiveGsp(
    @Param('provider') provider: string,
    @Body() payload: Record<string, unknown>,
    @Headers('idempotency-key') idempotencyKey?: string,
  ): Promise<CallbackResponse> {
    return this.receive('gsp', provider, payload, idempotencyKey);
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
}
