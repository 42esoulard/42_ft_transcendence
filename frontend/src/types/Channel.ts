import { ChannelMember } from "./ChannelMember";
import { Message } from "./Message"

export interface Channel {
  id: number;
  name: string;
  type: string;
  messages: Message[];
  channel_members: ChannelMember[];
}