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
  readonly channel_id: number;
  /**
   * Id of the user who posted it
   */
  readonly author_id: number;

  /*
   * Message content
   */

  readonly content: string;
}
