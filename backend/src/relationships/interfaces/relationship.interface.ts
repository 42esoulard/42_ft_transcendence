import { User } from 'src/users/interfaces/user.interface';

export class Relationship {
  id: number;
  pending: boolean;
  created_at: Date;
  requesterId: number;
  adresseeId: number;
  nature?: string;
}
