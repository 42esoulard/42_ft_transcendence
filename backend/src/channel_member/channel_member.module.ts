import { Module } from '@nestjs/common';
import { ChannelMembersService } from './channel_member.service';
import { ChannelMembersController } from './channel_member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelMembers } from './entity/channel_member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelMembers])],
  providers: [ChannelMembersService],
  controllers: [ChannelMembersController],
})
export class ChannelMembersModule {}
