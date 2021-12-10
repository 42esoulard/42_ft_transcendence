import { Channels } from 'src/channels/entity/channels.entity';
import { Users } from 'src/users/entity/users.entity';
export declare class Messages {
  id: number;
  channel: Channels;
  author: Users;
  content: string;
  created_at: Date;
}
