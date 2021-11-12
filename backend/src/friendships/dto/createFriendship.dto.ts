// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/users/interfaces/user.interface';

export class CreateFriendshipDto {
  readonly requester: User;
  readonly adressee: User;
}
