import { User } from "./User";
import { Message } from "./Message"

export interface Channel {
  id: number;
  name: string;
  type: string;
  owner: User | null;
  messages: Message[] | null;
  members: User[] | null;
}