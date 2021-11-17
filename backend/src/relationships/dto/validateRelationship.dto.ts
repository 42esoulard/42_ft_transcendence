// import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { User } from 'src/users/interfaces/user.interface';

export class ValidateRelationshipDto {
  readonly adresseeId: number;
  readonly requesterId: number;
}
