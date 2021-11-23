import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './interfaces/message.interface';
import { CreateMessageDto } from './dto/createMessage.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/auth/guards/jwtTwoFactor.guard';
// import { Channel } from 'src/channels/interfaces/channel.interface';
// import { UpdateMessageDto } from './dto/updateMessage.dto';

@ApiTags('Chat')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  /**
   * Lists all messages in database.
   */
  // @Get()
  // async getMessages(): Promise<Message[]> {
  //   const messages: Message[] = await this.messageService.getMessages();
  //   if (messages == undefined) {
  //     throw new NotFoundException('No messages in database');
  //   }
  //   return messages;
  // }

  /**
   * Returns a message found in database by its id.
   */
  // @Get(':id')
  // @ApiOkResponse({
  //   description: 'The message has been found in database',
  //   type: Message,
  // })
  // @ApiNotFoundResponse({
  //   description: 'Message not found',
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid ID supplied',
  // })
  // async getMessageById(@Param('id') id: number): Promise<Message> {
  //   const message: Message = await this.messageService.getMessageById(id);
  //   if (message == undefined) {
  //     throw new NotFoundException('Message not found');
  //   }
  //   return message;
  // }

  /**
   * Returns a message found in database by its id.
   */
  // @Get('/in/:channel_id')
  // async getChannelMessages(
  //   @Param('channel_id') channel: Channel,
  // ): Promise<Message[]> {
  //   const messages: Message[] = await this.messageService.getChannelMessages(
  //     channel,
  //   );
  //   if (messages == undefined) {
  //     throw new NotFoundException('Messages not found');
  //   }
  //   return messages;
  // }
  // @ApiOkResponse({
  //   description: "The channel's messages have been found in database",
  //   type: Array(Message),
  // })
  // @ApiNotFoundResponse({
  //   description: 'Message not found',
  // })
  // @ApiBadRequestResponse({
  //   description: 'Invalid ID supplied',
  // })

  /**
   * Save a new message to database from the POST body
   */
  @Post()
  @UseGuards(JwtTwoFactorGuard)
  async saveMessage(@Body() newMessage: CreateMessageDto): Promise<Message> {
    const msg: Message = await this.messageService.saveMessage(newMessage);
    if (msg == undefined) {
      throw new NotFoundException('Failed to save message');
    }
    return msg;
  }

  // @Post()
  // @ApiCreatedResponse({
  // 	description: 'The message has been successfully updated.',
  // 	type: Message,
  //   })
  // async updateMessage(@Body() updatedMessage : UpdateMessageDto) : Promise<Message> {
  // 	return await this.messageService.updateMessage(updatedMessage);
  // }
}
