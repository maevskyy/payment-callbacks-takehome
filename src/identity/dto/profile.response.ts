import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponse {
  @ApiProperty({ example: '9fdf8b8d-3d63-4bbd-baa8-9a22f64d5e2f' })
  id!: string;

  @ApiProperty({ example: 'brand-a' })
  brandId!: string;

  @ApiProperty({ example: 'user@brand-a.com' })
  email!: string;
}
