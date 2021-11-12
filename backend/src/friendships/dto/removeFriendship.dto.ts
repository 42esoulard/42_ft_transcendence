// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/users/interfaces/user.interface';

export class RemoveFriendshipDto {
  readonly user1: User;
  readonly user2: User;
}
