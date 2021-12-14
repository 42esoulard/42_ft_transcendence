import { GameUser } from 'src/pong/entity/gameUser.entity';
import { Messages } from 'src/messages/entity/messages.entity';
import { Relationships } from 'src/relationships/entity/relationships.entity';
import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
import { Role } from 'src/auth/models/role.enum';
export declare class Users {
  id: number;
  role: Role;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_secret: string;
  two_fa_enabled: boolean;
  banned: boolean;
  refresh_token: string;
  expiry_date: Date;
  created_at: Date;
  games: GameUser[];
  messages: Messages[];
  channel_members: ChannelMembers[];
  relationships_requested: Relationships[];
  relationships_adressed: Relationships[];
}
