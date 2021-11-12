import { ChannelMember, Message, Friendship, GameUser } from 'sdk/typescript-axios-client-generated';

export interface User {
  id: number;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_secret: string;
  two_fa_enabled: boolean;
  refresh_token: string;
  expiry_date: string;
  games: GameUser[];
  friendships_requested: Friendship[];
  friendships_adressed: Friendship[];
  created_at?: string;
  messages: Message[];
  channel_members: ChannelMember[];
}
