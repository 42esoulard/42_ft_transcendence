// import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto {

	readonly id: number;
  readonly username: string;
  readonly two_fa_enabled: boolean;
	readonly avatar?: string;
}
