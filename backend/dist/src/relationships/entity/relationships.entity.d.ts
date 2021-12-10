import { Users } from 'src/users/entity/users.entity';
export declare class Relationships {
  id: number;
  requesterId: number;
  requester: Users;
  adresseeId: number;
  adressee: Users;
  pending: boolean;
  nature: string;
  created_at: Date;
}
