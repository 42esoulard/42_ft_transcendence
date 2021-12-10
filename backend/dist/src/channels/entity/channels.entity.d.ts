import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
import { Messages } from 'src/messages/entity/messages.entity';
export declare class Channels {
  id: number;
  name: string;
  type: string;
  password: string;
  channel_members: ChannelMembers[];
  messages: Messages[];
  created_at: Date;
}
