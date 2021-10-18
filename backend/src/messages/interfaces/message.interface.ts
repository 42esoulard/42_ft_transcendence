import { Channel } from 'src/channels/interfaces/channel.interface';
import { User } from 'src/users/interfaces/user.interface';
import { Timestamp } from 'typeorm';

export class Message {
  id: number;
  channel: Channel;
  author: User;
  content: string;
  created_at: Date;
}
