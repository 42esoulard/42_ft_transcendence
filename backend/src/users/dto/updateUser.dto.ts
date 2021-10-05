// import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './createUser.dto';

export class UpdateUserDto extends CreateUserDto {

	/**
	 * The id of the updated user.
	 * ofc this dto needs other attributes inherited
	 * CreateUserDtofrom
	 */
	readonly id: number;
}
