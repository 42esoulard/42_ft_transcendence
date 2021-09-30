// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  /**
   * Message id
   */
  // @ApiPropertyOptional()
  // readonly id: number;//STRING?

  /**
   * Channel of the id where the message was posted
   */
  readonly channelId: number; //STRING?

  /**
   * Id of the user who posted it
   */
  readonly authorId: number; //STRING?

  /*
   * Message content
   */

  readonly content: string;
}
