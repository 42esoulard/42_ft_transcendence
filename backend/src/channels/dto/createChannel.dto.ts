import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateChannelDto {
	
	/**
	* Channel id
	*/
	// @ApiPropertyOptional()
	// readonly id: number;//STRING?
	
	/**
	* Id of the user who posted it
	*/
	readonly ownerId: number;//STRING?

	/**
	* Password for type protected_by_password
	*/
	readonly password: string;

	/*
	* Channel type (private/public/protected_by_password)
	*/

	readonly type: string;

}
