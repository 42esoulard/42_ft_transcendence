import { User } from 'src/users/interfaces/user.interface';
import { Channel } from 'src/channels/interfaces/channel.interface';
export declare class ChannelMember {
  id: number;
  channel: Channel;
  member: User;
  is_owner: boolean;
  is_admin: boolean;
  notification: boolean;
  new_message: boolean;
  mute: string | null;
  ban: string | null;
}
