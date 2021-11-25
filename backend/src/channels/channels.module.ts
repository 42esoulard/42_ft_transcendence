import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channels } from './entity/channels.entity';
import { UsersModule } from 'src/users/users.module';
export { ChannelsService } from './channels.service';
import { ChannelMembersModule } from 'src/channel_members/channel_members.module';
import { RelationshipsModule } from 'src/relationships/relationships.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channels]),
    UsersModule,
    ChannelMembersModule,
    RelationshipsModule,
  ],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [ChannelsService],
})
export class ChannelsModule {}
