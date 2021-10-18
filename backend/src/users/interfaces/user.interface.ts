import { Message } from 'src/messages/interfaces/message.interface';
import { Channel } from 'src/channels/interfaces/channel.interface';

export class User {
  id: number;
  username: string;
  forty_two_login: string;
  avatar: string;
  two_fa_secret: string;
  two_fa_enabled: boolean;
  refresh_token: string;
  expiry_date: Date;
  messages: Message[] | null;
  channels: Channel[] | null;
}
