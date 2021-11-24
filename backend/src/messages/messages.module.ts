import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Messages } from './entity/messages.entity';
import { ChannelsModule } from 'src/channels/channels.module';
import { UsersModule } from 'src/users/users.module';
import { ChannelMembersModule } from 'src/channel_members/channel_members.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Messages]),
    ChannelsModule,
    ChannelMembersModule,
    UsersModule,
  ],
  providers: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
