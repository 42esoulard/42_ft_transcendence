import { User } from 'src/users/interfaces/user.interface';
import { Message } from 'src/messages/interfaces/message.interface';

export class Channel {
  id: number;
  name: string;
  type: string;
  salt: string | null;
  password: string | null;
  owner: User | null;
  messages: Message[];
  members: User[] | null;
  created_at: Date;
}
