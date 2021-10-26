import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
	// @ApiPropertyOptional()
	// readonly id: number;

	/**
	* The name of the created user
	*/
	readonly username: string;

	/**
	* The 42 username of the created user
	*/
	readonly forty_two_login: string;  //OR 42 id (number so faster)?

  readonly two_fa_enabled: boolean;

  readonly expiry_date?: Date;

	/**
	 * The avatar of the created user
	 */
	readonly avatar?: string;

}
