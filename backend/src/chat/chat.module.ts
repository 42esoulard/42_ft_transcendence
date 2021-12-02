import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
// import { ChannelMembersModule } from 'src/channel_members/channel_members.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
// import { Relationships } from 'src/relationships/entity/relationships.entity';
// import { ChannelMembersModule } from 'src/channel_members/channel_members.module';
// import { RelationshipsModule } from 'src/relationships/relationships.module';
import { ChannelsModule } from 'src/channels/channels.module';

@Module({
  imports: [ChannelsModule],
  providers: [ChatGateway],
})
export class ChatModule {}
