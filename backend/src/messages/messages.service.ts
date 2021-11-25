import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Message } from './interfaces/message.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './entity/messages.entity';
import { CreateMessageDto } from './dto/createMessage.dto';
import { ChannelsService } from 'src/channels/channels.service';
import { ChannelMembersService } from 'src/channel_members/channel_members.service';
import { UsersService } from 'src/users/users.service';
// import { timestamp } from 'rxjs';
// import { UpdateMessageDto } from './dto/updateMessage.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
    private readonly channelService: ChannelsService,
    private readonly channelMemberService: ChannelMembersService,
    private readonly userService: UsersService,
  ) {}

  /**
   * Lists all messages in database
   * nb: find() is a function from the typeORM library
   */
  async getMessages(): Promise<Message[]> {
    return await this.messagesRepository.find();
  }

  /**
   * Lists all messages in a particular channel
   * nb: find() is a function from the typeORM library
   */
  // async getChannelMessages(channel: Channel): Promise<Message[]> {
  //   return await this.messagesRepository.find({ channel: channel });
  // }

  /**
   * Gets a message in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getMessageById(id: number): Promise<Message> {
    const res = await this.messagesRepository.findOne(id);
    // console.log('res', res);
    return res;
  }

  /**
   * Saves a new message into db
   * nb: save(message) is a function from the typeORM library
   */
  async saveMessage(messageDto: CreateMessageDto): Promise<Message> {
    // console.log(messageDto);
    const newMessage: Message = this.messagesRepository.create(messageDto);
    newMessage.channel = await this.channelService.getChannelById(
      messageDto.channel_id,
      messageDto.author_id,
    );
    newMessage.author = await this.userService.getUserbyId(
      messageDto.author_id,
    );
    await this.channelMemberService
      .getChannelMember(newMessage.channel, newMessage.author)
      .then((res) => {
        if (this.channelMemberService.checkMute(res)) {
          throw new ForbiddenException('muted');
        }
        if (res.ban) {
          throw new ForbiddenException('banned');
        }
      });

    return await this.messagesRepository
      .save(newMessage)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Message did not comply database requirements',
        );
      });
  }
}
