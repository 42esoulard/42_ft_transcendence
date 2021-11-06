import { Message } from './Message';
import { Channel } from './Channel';
import { GameUser } from './GameUser';
import { Friendship } from './Friendship';

export interface User {
  id: number;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_secret: string;
  two_fa_enabled: boolean;
  refresh_token: string;
  expiry_date: string;
  messages: Message[];
  channels: Channel[];
  games: GameUser[];
  friendships_requested: Friendship[];
  friendships_adressed: Friendship[];
  created_at?: string;
}
