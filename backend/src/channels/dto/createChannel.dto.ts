// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class CreateChannelDto {
  /**
   * Channel id
   */
  // @ApiPropertyOptional()
  // readonly id: number;

  /**
   * name of the channel
   */
  readonly name: string;

  /**
   * Id of the user who posted it
   */
  readonly owner_id: number;

  /**
   * Password for type protected_by_password
   */
  readonly password: string;

  /*
   * Channel type (private/public/protected_by_password)
   */

  readonly type: string;
}
