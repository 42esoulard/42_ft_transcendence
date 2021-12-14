import { Message } from 'src/messages/interfaces/message.interface';
import { GameUser } from 'src/pong/entity/gameUser.entity';
import { Relationship } from 'src/relationships/interfaces/relationship.interface';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';
export declare class User {
  id: number;
  username: string;
  created_at?: Date;
  forty_two_login?: string;
  avatar?: string;
  two_fa_secret?: string;
  two_fa_enabled?: boolean;
  refresh_token?: string;
  banned?: boolean;
  expiry_date?: Date;
  messages?: Message[];
  channel_members?: ChannelMember[];
  games?: GameUser[];
  role?: string;
  relationships_requested?: Relationship[];
  relationships_adressed?: Relationship[];
}
