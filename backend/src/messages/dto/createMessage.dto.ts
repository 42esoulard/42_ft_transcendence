// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  /**
   * Message id
   */
  // @ApiPropertyOptional()
  // readonly id: number;

  /**
   * Channel of the id where the message was posted
   */
  readonly channelId: number;
  /**
   * Id of the user who posted it
   */
  readonly authorId: number;

  /*
   * Message content
   */

  readonly content: string;
}
