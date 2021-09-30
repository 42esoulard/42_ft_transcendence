import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entity/messages.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Messages])],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
