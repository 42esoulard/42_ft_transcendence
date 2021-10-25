import { Message } from "sdk/typescript-axios-client-generated";
import { ChannelMember } from "./ChannelMember";

export interface User {
  id: number;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_enabled: boolean;
  refresh_token: string;
  expiry_date: Date;
  // messages: Message[] | null;
  // // channels: Channel[] | null;
  // channel_members: ChannelMember;
  // created_at: Date;
}