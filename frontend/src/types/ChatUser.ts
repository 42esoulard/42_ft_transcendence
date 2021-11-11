import { ChannelMember } from "./ChannelMember";
import { Message } from "./Message";

export interface ChatUser {
  id: number;
  username: string;
  messages?: Message[];
  channel_members?: ChannelMember[];
}
