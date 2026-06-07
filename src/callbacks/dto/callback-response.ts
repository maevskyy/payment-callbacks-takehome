import { ApiProperty } from '@nestjs/swagger';

export class CallbackResponse {
  @ApiProperty({ enum: ['accepted', 'duplicate'], example: 'accepted' })
  status!: 'accepted' | 'duplicate';

  @ApiProperty({ example: 'evt_abc_123' })
  eventId!: string;
}
