import { User } from 'src/users/interfaces/user.interface';
import { Channel } from 'src/channels/interfaces/channel.interface';

export class ChannelMember {
  id: number;
  channel: Channel;
  member: User;
  is_owner: boolean;
  is_admin: boolean;
  mute: Date | null;
  ban: Date | null;
  // created_at: Date;
}
