import { User } from 'src/users/interfaces/user.interface';

export class GetFriendshipsDto {
  readonly user: User;
  readonly pending: boolean;
}
