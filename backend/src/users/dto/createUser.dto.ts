import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
	readonly username: string;
	readonly forty_two_login: string;  //OR 42 id (number so faster)?
  readonly two_fa_enabled: boolean;
  readonly banned?: boolean;
  readonly expiry_date?: Date;
	readonly avatar?: string;

}
