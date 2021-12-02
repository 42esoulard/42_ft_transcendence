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
import { ApiTags } from '@nestjs/swagger';
import { JwtTwoFactorGuard } from 'src/auth/guards/jwtTwoFactor.guard';

@ApiTags('Chat')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

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
}
