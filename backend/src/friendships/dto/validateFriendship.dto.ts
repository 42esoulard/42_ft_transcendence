// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/users/interfaces/user.interface';

export class ValidateFriendshipDto {
  readonly pending: boolean;
  readonly adressee: User;
  readonly requester_id: number;
}
