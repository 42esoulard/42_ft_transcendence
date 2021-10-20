import { Channel } from "./Channel";

export interface ChatUser {
  id: number;
  username: string;
  // forty_two_login: string;
  // avatar: string;
  channels: Channel[] | null;

  // two_fa_enabled: string;
  // refresh_token: string;
  // expiry_date: Date;
  // created_at: Date;
}