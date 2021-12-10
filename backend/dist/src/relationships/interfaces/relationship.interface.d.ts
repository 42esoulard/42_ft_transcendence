import { Users } from 'src/users/entity/users.entity';
export declare class Relationship {
  id: number;
  pending: boolean;
  created_at: Date;
  requesterId: number;
  adresseeId: number;
  nature?: string;
  adressee?: Users;
  requester?: Users;
}
