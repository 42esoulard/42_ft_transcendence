// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/users/interfaces/user.interface';

export class ValidateFriendshipDto {
  readonly adressee: User;
  readonly requester: User;
}
