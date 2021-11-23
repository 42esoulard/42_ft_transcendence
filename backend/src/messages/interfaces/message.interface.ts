import { Channels } from 'src/channels/entity/channels.entity';
import { Channel } from 'src/channels/interfaces/channel.interface';
import { Users } from 'src/users/entity/users.entity';
import { User } from 'src/users/interfaces/user.interface';
import { Timestamp } from 'typeorm';

export class Message {
  id: number;
  channel: Channels;
  author: Users;
  content: string;
  created_at: Date;
}
