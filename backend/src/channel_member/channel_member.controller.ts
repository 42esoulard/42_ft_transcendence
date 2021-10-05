import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ChannelMembersService } from './channel_member.service';
import { ChannelMember } from './interfaces/channel_member.interface';
import { CreateChannelMemberDto } from './dto/createChannelMember.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
// import { UpdateChannelDto } from './dto/updateChannel.dto';

@Controller('channelMembers')
export class ChannelMembersController {
  constructor(private readonly channelMemberService: ChannelMembersService) {}

  /**
   * Lists all channel_members.
   */
  @Get()
  @ApiOkResponse({
    description: 'The channel-members have been found in database',
    type: ChannelMember,
  })
  @ApiNotFoundResponse({
    description: 'Channel-members not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getChannelMembers(): Promise<ChannelMember[]> {
    const channelMembers: ChannelMember[] =
      await this.channelMemberService.getChannelMembers();
    if (channelMembers == undefined) {
      throw new NotFoundException('No channel members in database');
    }
    return channelMembers;
  }

  /**
   * Lists all channels a member has joined
   */
  @Get('/by_member/:id')
  @ApiOkResponse({
    description: "The member's channels have been found in database",
    type: ChannelMember,
  })
  @ApiNotFoundResponse({
    description: 'Channels not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getChannelsByMember(@Param('id') id: number): Promise<ChannelMember[]> {
    const channelMembers: ChannelMember[] =
      await this.channelMemberService.getChannelsByMember(id);
    if (channelMembers == undefined) {
      throw new NotFoundException('No member channels in database');
    }
    return channelMembers;
  }

  /**
   * Lists all the members of a channel
   */
  @Get('/by_channel/:id')
  @ApiOkResponse({
    description: 'The channel members have been found in database',
    type: ChannelMember,
  })
  @ApiNotFoundResponse({
    description: 'Channel not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getMembersByChannel(@Param('id') id: number): Promise<ChannelMember[]> {
    const channelMembers: ChannelMember[] =
      await this.channelMemberService.getMembersByChannel(id);
    if (channelMembers == undefined) {
      throw new NotFoundException('No channel members in database');
    }
    return channelMembers;
  }

  /**
   * Returns a channel-member found in database by its channel_id and user_id.
   */
  @Get('/is_member/:channel_id/:member_id')
  @ApiOkResponse({
    description: 'The channel member has been found in database',
    type: ChannelMember,
  })
  @ApiNotFoundResponse({
    description: 'Channel not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getChannelMember(
    @Param('channel_id') channel_id: number,
    @Param('member_id') member_id: number,
  ): Promise<ChannelMember> {
    const channel: ChannelMember =
      await this.channelMemberService.getChannelMember(channel_id, member_id);
    if (channel == undefined) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  /**
   * Save a new channel-member to database from the POST body
   */
  @Post()
  async saveChannelMember(
    @Body() newChannelMember: CreateChannelMemberDto,
  ): Promise<ChannelMember> {
    return await this.channelMemberService.saveChannelMember(newChannelMember);
  }
}
