import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  username: string;
  readonly forty_two_login: string;
  readonly two_fa_enabled: boolean;
  readonly banned?: boolean;
  readonly expiry_date?: Date;
  readonly avatar?: string;
}
