import { User } from 'src/users/interfaces/user.interface';

export class CreateRelationshipDto {
  readonly requester: User;
  readonly adressee: User;
  readonly nature?: string;
}
