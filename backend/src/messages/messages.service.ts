import { Injectable } from '@nestjs/common';
import { Message } from './interfaces/message.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './entity/messages.entity';
import { CreateMessageDto } from './dto/createMessage.dto';
import { timestamp } from 'rxjs';
// import { UpdateMessageDto } from './dto/updateMessage.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly MessagesRepository: Repository<Messages>,
  ) {}

  /**
   * Lists all messages in database
   * nb: find() is a function from the typeORM library
   */
  async getMessages(): Promise<Message[]> {
    return await this.MessagesRepository.find();
  }

  /**
   * Lists all messages in a particular channel
   * nb: find() is a function from the typeORM library
   */
  async getChannelMessages(chanId: number): Promise<Message[]> {
    return await this.MessagesRepository.find({ channel_id: chanId });
  }

  /**
   * Gets a message in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getMessagebyId(id: number): Promise<Message> {
    const res = await this.MessagesRepository.findOne(id);
    console.log('res', res);
    return res;
  }

  /**
   * Saves a new message into db after generating pw hash and salt
   * nb: save(message) is a function from the typeORM library
   */
  async saveMessage(messageDto: CreateMessageDto): Promise<Message> {
    // newMessage must be of type Message or CreateMessageDto ??
    console.log(messageDto);
    const newMessage: Message = {
      channel_id: messageDto.channelId,
      id: 1,
      content: messageDto.content,
      author_id: messageDto.authorId,
      created_at: Math.floor(Date.now() / 1000),
    };

    return await this.MessagesRepository.save(newMessage);
  }

  /**
   * We probably don't need to make messages editable
   * Updates a message into db
   * nb: save(message) is a function from the typeORM library
   */
  // async updateMessage(updatedMessage: UpdateMessageDto): Promise<Message> {
  // 	return await this.MessagesRepository.save(updatedMessage);
  // }
}
