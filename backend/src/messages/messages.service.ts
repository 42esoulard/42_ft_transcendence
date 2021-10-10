import { Injectable } from '@nestjs/common';
import { Message } from './interfaces/message.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Messages } from './entity/messages.entity';
import { CreateMessageDto } from './dto/createMessage.dto';
// import { timestamp } from 'rxjs';
// import { UpdateMessageDto } from './dto/updateMessage.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Messages)
    private readonly messagesRepository: Repository<Messages>,
  ) {}

  private index: 1;

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
  async getChannelMessages(chan_id: number): Promise<Message[]> {
    return await this.messagesRepository.find({ channel_id: chan_id });
  }

  /**
   * Gets a message in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getMessageById(id: number): Promise<Message> {
    const res = await this.messagesRepository.findOne(id);
    console.log('res', res);
    return res;
  }

  /**
   * Saves a new message into db
   * nb: save(message) is a function from the typeORM library
   */
  async saveMessage(messageDto: CreateMessageDto): Promise<Message> {
    // console.log(messageDto);
    const newMessage: Message = {
      id: this.index,
      channel_id: messageDto.channel_id,
      author_id: messageDto.author_id,
      content: messageDto.content,
      // created_at: Math.floor(Date.now() / 1000),
    };

    return await this.messagesRepository.save(newMessage);
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
