// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateChannelMemberDto {
  /**
   * id of the channel
   */
  readonly channelId: number;

  /**
   * Id of the user
   */
  readonly userId: number;

  /**
   * Is user admin
   */
  readonly isAdmin: boolean;
}
