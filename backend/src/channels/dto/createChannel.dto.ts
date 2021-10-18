// import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

import { User } from 'src/users/interfaces/user.interface';

export class CreateChannelDto {
  readonly name: string;
  readonly owner: User;
  readonly password: string;
  readonly type: string;
}
