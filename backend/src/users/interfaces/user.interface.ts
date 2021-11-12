import { Message } from 'src/messages/interfaces/message.interface';
import { GameUser } from 'src/pong/entity/gameUser.entity';
import { Friendship } from 'src/friendships/interfaces/friendship.interface';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';

export class User {
  id: number;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_secret: string;
  two_fa_enabled: boolean;
  refresh_token: string;
  banned: boolean;
  expiry_date: Date;
  messages: Message[];
  channel_members: ChannelMember[];
  games: GameUser[];
  friendships_requested: Friendship[];
  friendships_adressed: Friendship[];
}
