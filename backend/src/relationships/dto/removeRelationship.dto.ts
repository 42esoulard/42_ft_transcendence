// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/users/interfaces/user.interface';

export class RemoveRelationshipDto {
  readonly userId1: number;
  readonly userId2: number;
  readonly nature?: string;
}
