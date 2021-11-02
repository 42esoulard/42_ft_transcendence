import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from './interfaces/channel.interface';
import { CreateChannelDto } from './dto/createChannel.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';
// import { UpdateChannelDto } from './dto/updateChannel.dto';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}
  // private readonly userService: UsersService;
  /**
   * Lists all channels in database.
   */
  @Get()
  async getChannels(): Promise<Channel[]> {
    const channels: Channel[] = await this.channelService.getChannels();
    if (channels == undefined) {
      throw new NotFoundException('No channels in database');
    }
    return channels;
  }

  /**
   * Returns a channel found in database by its id.
   */
  @Get(':id')
  @ApiOkResponse({
    description: 'The channel has been found in database',
    type: Channel,
  })
  @ApiNotFoundResponse({
    description: 'Channel not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getChannelById(@Param('id') id: number): Promise<Channel> {
    const channel: Channel = await this.channelService.getChannelById(id);
    if (channel == undefined) {
      if (id == 1) {
        return await this.channelService.seed();
      }
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  /**
   * Returns a channel found in database by its id.
   */
  @Get('/name/:name')
  @ApiOkResponse({
    description: 'The channel has been found in database',
    type: Channel,
  })
  @ApiNotFoundResponse({
    description: 'Channel not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getChannelByName(@Param('name') name: string): Promise<Channel> {
    const channel: Channel = await this.channelService.getChannelByName(name);
    if (channel == undefined) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  /**
   * Save a new channel to database from the POST body
   */
  @Post()
  async saveChannel(
    @Body() newChannel: CreateChannelDto,
  ): Promise<ChannelMember> {
    return await this.channelService.saveChannel(newChannel);
  }

  @Get('/joinchannel/:channel/:user')
  async joinChannel(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
  ): Promise<ChannelMember> {
    return await this.channelService.joinChannel(channel_id, user_id);
  }

  @Get('/join-protected/:channel/:attempt')
  async checkPasswordMatch(
    @Param('channel') channel_id: number,
    @Param('attempt') attempt: string,
  ): Promise<boolean> {
    console.log("in controller attempt", attempt)
    return await this.channelService.checkPasswordMatch(channel_id, attempt);
  }

  @Get('/user/:id')
  async getUserChannels(@Param('id') id: number): Promise<ChannelMember[]> {
    return await this.channelService.getUserChannels(id);
  }

  @Get('/avail/:id')
  async getAvailableChannels(@Param('id') id: number): Promise<Channel[]> {
    return await this.channelService.getAvailableChannels(id);
  }

  @Get('/channelmember/:channel/:user')
  async getChannelMember(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
  ): Promise<ChannelMember> {
    return await this.channelService.getChannelMember(channel_id, user_id);
  }

  @Post('/leavechannel/:channel/:user')
  async leaveChannel(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
  ) {
    await this.channelService.leaveChannel(channel_id, user_id);
  }
}
