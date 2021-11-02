import { ChannelMember } from "./ChannelMember";
import { Message } from "./Message"

export interface Channel {
  id: number;
  name: string;
  type: string;
  messages: Message[];
  password: string;
  channel_members: ChannelMember[];
}