import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
	// @ApiPropertyOptional()
	// readonly id: number;
	
	/**
	* The name of the created user
	*/
	readonly username: string;
	
	/**
	* The password of the created user
	*/
	readonly password: string;
	
	/**
	 * The password of the created user
	 */
	readonly avatar?: string;
	
}
