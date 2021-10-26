// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/users/interfaces/user.interface';

export class RemoveFriendshipDto {
  readonly first_id: number;
  readonly second_id: number;
}
