import { Message } from 'src/messages/interfaces/message.interface';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';
export declare class Channel {
  id: number;
  name: string;
  type: string;
  password: string;
  messages: Message[];
  channel_members: ChannelMember[];
  created_at: Date;
}
