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
   * Saves a new message into db
   * nb: save(message) is a function from the typeORM library
   */
  async saveMessage(messageDto: CreateMessageDto): Promise<Message> {
    const newMessage: Message = this.messagesRepository.create(messageDto);
    newMessage.author = await this.userService.getUserbyId(
      messageDto.author_id,
    );
    newMessage.channel = await this.channelService.getChannelById(
      messageDto.channel_id,
      messageDto.author_id,
    );
    if (newMessage.channel == undefined || newMessage.author == undefined) {
      return undefined;
    }
    await this.channelMemberService
      .getChannelMember(newMessage.channel, newMessage.author)
      .then(async (res) => {
        if (newMessage.author.role == 'user' && res == undefined) {
          throw new ForbiddenException('not a member');
        }
        if (
          newMessage.author.role == 'user' &&
          this.channelMemberService.checkMute(res)
        ) {
          throw new ForbiddenException('muted');
        }
        if (
          newMessage.author.role == 'user' &&
          this.channelMemberService.checkBan(res)
        ) {
          throw new ForbiddenException('banned');
        }
        if (newMessage.channel.messages.length > 50) {
          await this.messagesRepository
            .delete(newMessage.channel.messages[0].id)
            .catch(() => {
              throw new BadRequestException('Failed to purge messages from db');
            });
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
