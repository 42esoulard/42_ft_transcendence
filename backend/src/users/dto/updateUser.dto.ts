// import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto {

	readonly id: number;
	readonly avatar?: string;
}
