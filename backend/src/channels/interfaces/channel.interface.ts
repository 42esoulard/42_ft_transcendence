import { User } from 'src/users/interfaces/user.interface';
import { Message } from 'src/messages/interfaces/message.interface';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';

export class Channel {
  id: number;
  name: string;
  type: string;
  // salt: string | null;
  password: string;
  // owner: User | null;
  messages: Message[];
  channel_members: ChannelMember[];
  created_at: Date;
}
