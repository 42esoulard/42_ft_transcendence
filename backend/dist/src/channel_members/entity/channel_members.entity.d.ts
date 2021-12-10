import { Channels } from 'src/channels/entity/channels.entity';
import { Users } from 'src/users/entity/users.entity';
export declare class ChannelMembers {
  id: number;
  channel: Channels;
  member: Users;
  is_owner: boolean;
  is_admin: boolean;
  notification: boolean;
  new_message: boolean;
  ban: string;
  mute: string;
  created_at: Date;
}
