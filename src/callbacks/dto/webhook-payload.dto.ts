import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WebhookPayloadDto {
  @ApiProperty({ example: 'evt_abc_123' })
  eventId!: string;

  @ApiProperty({ example: 'payment.succeeded' })
  type!: string;

  @ApiPropertyOptional({ example: 1000 })
  amount?: number;
}
