import { User } from 'src/users/interfaces/user.interface';

export class CreateRelationshipDto {
  readonly requesterId: number;
  readonly adresseeId: number;
  readonly nature?: string;
}
