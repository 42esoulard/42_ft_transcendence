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
// import { UpdateChannelDto } from './dto/updateChannel.dto';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}

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
  async getChannel(@Param('id') id: number): Promise<Channel> {
    const channel: Channel = await this.channelService.getChannelbyId(id);
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

  // @Post()
  // @ApiCreatedResponse({
  // 	description: 'The channel has been successfully updated.',
  // 	type: Channel,
  //   })
  // async updateChannel(@Body() updatedChannel : UpdateChannelDto) : Promise<Channel> {
  // 	return await this.channelService.updateChannel(updatedChannel);
  // }
}
