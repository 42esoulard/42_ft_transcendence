export interface User {
  id: number;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_enabled: boolean;
  refresh_token: string;
  expiry_date: Date;
  messages: Message[] | null;
  channels: Channel[] | null;
  games: GameUser[] | null;
}
