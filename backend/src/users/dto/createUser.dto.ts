import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
	// @ApiPropertyOptional()
	// readonly id: number;
	
	/**
	* The name of the created user
	*/
	readonly firstname: string;
	
	/**
	* The last name of the created user
	*/
	readonly lastname: string

	/**
	* The password of the created user
	*/
	readonly password: string;
}
