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
import { User } from 'src/users/interfaces/user.interface';
import { UsersModule } from 'src/users/users.module';
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
        return await this.channelService.seed()
        //   return await this.channelService.getChannelById(id);
        // });
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
  async saveChannel(@Body() newChannel: CreateChannelDto): Promise<Channel> {
    return await this.channelService.saveChannel(newChannel);
  }

  @Get('/channel/:channel/user/:user')
  async joinChannel(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
  ) {
    await this.channelService.joinChannel(channel_id, user_id);
  }

  // @Get('/user/:user')
  // async getJoinedChannels(@Param('user') user_id: number): Promise<Channel[]> {
  //   console.log('heree', await this.channelService.getJoinedChannels(user_id));
  //   await this.channelService.getJoinedChannels(user_id).then((res) => {
  //     console.log("res.channels", res.channels)
  //     return res.channels;
  //   });
  //   return [];
  //   // return await this.channelService.getJoinedChannels(user_id);
  // }

  @Post('/channel/:channel/user/:user')
  async leaveChannel(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
  ) {
    // const channel = await this.getChannelById(channel_id);
    // const user = await this.userService.getUserbyId(user_id);
    // await this.channelService.leaveChannel(channel, user);
  }

  // @Post()
  // @ApiCreatedResponse({
  // 	description: 'The channel has been successfully updated.',
  // 	type: Channel,
  //   })
  // async updateChannel(@Body() updatedChannel : UpdateChannelDto) : Promise<Channel> {
  // 	return await this.channelService.updateChannel(updatedChannel);
  // }
}
