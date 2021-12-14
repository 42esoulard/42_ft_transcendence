import { MessagesService } from './messages.service';
import { Message } from './interfaces/message.interface';
import { CreateMessageDto } from './dto/createMessage.dto';
export declare class MessagesController {
  private readonly messageService;
  constructor(messageService: MessagesService);
  saveMessage(newMessage: CreateMessageDto): Promise<Message>;
}
