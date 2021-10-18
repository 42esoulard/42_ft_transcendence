import { Channel } from "./Channel";
import { User } from "./User";

export interface Message {
  id: number;
  channel: Channel;
  author: User;
  content: string;
  created_at: Date;
}