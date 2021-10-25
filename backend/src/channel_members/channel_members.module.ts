import { Module } from '@nestjs/common';
import { ChannelMembersService } from './channel_members.service';
// import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMembers } from './entity/channel_members.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelMembers])],
  providers: [ChannelMembersService],
  // controllers: [ChannelsController],
  exports: [ChannelMembersService],
})
export class ChannelMembersModule {}
