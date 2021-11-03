import { Channel } from "./Channel";
import { ChatUser } from "./ChatUser";

export interface ChannelMember {
  id: number;
  member: ChatUser;
  channel: Channel;
  // forty_two_login: string;
  // avatar: string;
  is_admin: boolean;
  is_owner: boolean;

  // two_fa_enabled: string;
  // refresh_token: string;
  // expiry_date: Date;
  // created_at: Date;
}