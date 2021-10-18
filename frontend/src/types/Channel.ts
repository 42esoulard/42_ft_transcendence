import { ChatUser } from "./ChatUser";
import { Message } from "./Message"

export interface Channel {
  id: number;
  name: string;
  type: string;
  owner: ChatUser | null;
  messages: Message[] | null;
  members: ChatUser[] | null;
}