import { Channel } from "./Channel";
import { ChatUser } from "./ChatUser";

export interface Message {
  id: number;
  channel: Channel;
  author: ChatUser;
  content: string;
  created_at: string;
}