// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

import { User } from 'src/users/interfaces/user.interface';

export class CreateChannelDto {
  readonly name: string;
  readonly owner_id: number;
  readonly password: string;
  readonly type: string;
  readonly notification: boolean;
}
