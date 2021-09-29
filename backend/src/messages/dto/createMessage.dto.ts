import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMessageDto {
	
	/**
	* Message id
	*/
	// @ApiPropertyOptional()
	readonly id: number;//STRING?
	
	/**
	* Channel of the id where the message was posted
	*/
	readonly channel_id: number;//STRING?

	/**
	* Id of the user who posted it
	*/
	readonly author_id: number;//STRING?

	/*
	* Message content
	*/

	readonly content: string;


	/*
	* Timestamp of posting date
	*/

	readonly created_at: Date;
}
