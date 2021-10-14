// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateChannelMemberDto {
  /**
   * id of the channel
   */
  readonly channel_id: number;

  /**
   * Id of the user
   */
  readonly user_id: number;

  /**
   * Is user admin
   */
  readonly is_admin: boolean;
}
