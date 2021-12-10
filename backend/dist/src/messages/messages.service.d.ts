import { Message } from './interfaces/message.interface';
import { Repository } from 'typeorm';
import { Messages } from './entity/messages.entity';
import { CreateMessageDto } from './dto/createMessage.dto';
import { ChannelsService } from 'src/channels/channels.service';
import { ChannelMembersService } from 'src/channel_members/channel_members.service';
import { UsersService } from 'src/users/users.service';
export declare class MessagesService {
  private readonly messagesRepository;
  private readonly channelService;
  private readonly channelMemberService;
  private readonly userService;
  constructor(
    messagesRepository: Repository<Messages>,
    channelService: ChannelsService,
    channelMemberService: ChannelMembersService,
    userService: UsersService,
  );
  getMessages(): Promise<Message[]>;
  saveMessage(messageDto: CreateMessageDto): Promise<Message>;
}
