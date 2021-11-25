import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from './interfaces/channel.interface';
import { CreateChannelDto } from './dto/createChannel.dto';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';
import { DeleteResult } from 'typeorm';
import { JwtTwoFactorGuard } from 'src/auth/guards/jwtTwoFactor.guard';
// import { UpdateChannelDto } from './dto/updateChannel.dto';

@ApiTags('Chat')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}
  // private readonly userService: UsersService;
  /**
   * Lists all channels in database.
   */
  @Get()
  @UseGuards(JwtTwoFactorGuard)
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
  @Get('/channel/:chanId/:userId')
  @UseGuards(JwtTwoFactorGuard)
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
  async getChannelById(
    @Param('chanId') chanId: number,
    @Param('userId') userId: number,
  ): Promise<Channel> {
    console.log("IN CONTROLLER GCBI", chanId, userId);
    const channel: Channel = await this.channelService.getChannelById(
      chanId,
      userId,
    );
    if (channel == undefined) {
      if (chanId == 1) {
        const generalChan: Channel = await this.channelService.seed();
        if (generalChan == undefined) {
          throw new NotFoundException("Couldn't initialize general channel");
        }
        return generalChan;
      }
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  /**
   * Returns a channel found in database by its id.
   */
  @Get('/name/:name')
  @UseGuards(JwtTwoFactorGuard)
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
  @UseGuards(JwtTwoFactorGuard)
  async saveChannel(
    @Body() newChannel: CreateChannelDto,
  ): Promise<ChannelMember> {
    const owner: ChannelMember = await this.channelService.saveChannel(
      newChannel,
    );
    if (owner == undefined) {
      throw new NotFoundException('Failed to create channel');
    }
    return owner;
  }

  @Get('/join-channel/:channel/:user')
  @UseGuards(JwtTwoFactorGuard)
  async joinChannel(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
  ): Promise<ChannelMember> {
    const cm: ChannelMember = await this.channelService.joinChannel(
      channel_id,
      user_id,
    );
    if (cm == undefined) {
      throw new NotFoundException('Failed to join channel');
    }
    return cm;
  }

  @Get('/join-protected/:channel/:user/:attempt')
  @UseGuards(JwtTwoFactorGuard)
  async checkPasswordMatch(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
    @Param('attempt') attempt: string,
  ): Promise<boolean> {
    const match: boolean = await this.channelService.checkPasswordMatch(
      channel_id,
      user_id,
      attempt,
    );
    if (match == undefined) {
      throw new NotFoundException("Couldn't attempt to match password");
    }
    return match;
  }

  @Get('/user/:id')
  @UseGuards(JwtTwoFactorGuard)
  async getUserChannels(@Param('id') id: number): Promise<ChannelMember[]> {
    const cm: ChannelMember[] = await this.channelService.getUserChannels(id);
    if (cm == undefined) {
      throw new NotFoundException('No user channels found');
    }
    return this.channelService.filterBanned(cm);
  }

  @Get('/avail/:id')
  @UseGuards(JwtTwoFactorGuard)
  async getAvailableChannels(@Param('id') id: number): Promise<Channel[]> {
    const channels: Channel[] = await this.channelService.getAvailableChannels(
      id,
    );
    if (channels == undefined) {
      throw new NotFoundException('No available channels found');
    }
    return channels;
  }

  @Get('/channel-member/:channel/:user')
  @UseGuards(JwtTwoFactorGuard)
  async getChannelMember(
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
  ): Promise<ChannelMember> {
    const cm: ChannelMember = await this.channelService.getChannelMember(
      channel_id,
      user_id,
    );
    if (cm == undefined) {
      throw new NotFoundException('Channel Member not found');
    } else if (cm.ban) {
      throw new NotFoundException('banned');
    }
    return cm;
  }

  @Post('/leave-channel/:cm_id')
  @UseGuards(JwtTwoFactorGuard)
  async leaveChannel(@Param('cm_id') cm_id: number): Promise<DeleteResult> {
    const dr: DeleteResult = await this.channelService.leaveChannel(cm_id);
    if (dr == undefined) {
      throw new NotFoundException('Failed to leave channel');
    }
    return dr;
  }

  @Post('/delete-channel/:chan_id')
  @UseGuards(JwtTwoFactorGuard)
  async deleteChannel(
    @Param('chan_id') chan_id: number,
  ): Promise<DeleteResult> {
    const dr: DeleteResult = await this.channelService.deleteChannel(chan_id);
    if (dr == undefined) {
      throw new NotFoundException('Failed to leave channel');
    }
    return dr;
  }

  @Get('/admin-action/:action/:cm_id/:end_date')
  @UseGuards(JwtTwoFactorGuard)
  async muteBanMember(
    @Param('action') action: string,
    @Param('cm_id') cm_id: number,
    @Param('end_date') end_date: number,
  ): Promise<ChannelMember> {
    const cm: ChannelMember = await this.channelService.muteBanMember(
      action,
      cm_id,
      end_date,
    );
    if (cm == undefined) {
      throw new NotFoundException("Failed to edit member's mute/ban status");
    }
    return cm;
  }

  @Get('/toggle-admin/:cm_id')
  @UseGuards(JwtTwoFactorGuard)
  async toggleAdmin(@Param('cm_id') cm_id: number): Promise<ChannelMember> {
    const cm: ChannelMember = await this.channelService.toggleAdmin(cm_id);
    if (cm == undefined) {
      throw new NotFoundException("Failed to edit member's admin status");
    }
    return cm;
  }

  @Get('/update-pwd/:chan_id/:user_id/:pwd')
  @UseGuards(JwtTwoFactorGuard)
  async updateChannelPassword(
    @Param('chan_id') chan_id: number,
    @Param('user_id') user_id: number,
    @Param('pwd') pwd: string,
  ): Promise<Channel> {
    const channel: Channel = await this.channelService.updateChannelPassword(
      chan_id,
      user_id,
      pwd,
    );
    if (channel == undefined) {
      throw new NotFoundException('Failed to edit channel password');
    }
    return channel;
  }
}
