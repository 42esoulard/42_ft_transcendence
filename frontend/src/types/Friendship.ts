import { User } from "./User";

export interface Friendship {
  pending: boolean;
  created_at: Date;
  requester: User;
  adressee: User;
}
