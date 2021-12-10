import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  ForbiddenException,
  Req,
  BadRequestException,
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
import { Request } from 'express';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/models/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { User } from 'src/users/interfaces/user.interface';

@ApiTags('Chat')
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelsService) {}

  /*
   * Lists all channels in database.
   * Only allowed for website ADMIN and OWNER
   */
  @Get()
  @Roles(Role.ADMIN, Role.OWNER)
  @UseGuards(JwtTwoFactorGuard, RolesGuard)
  async getChannels(@Req() request: Request): Promise<Channel[]> {
    const channels: Channel[] = await this.channelService.getChannels();
    if (channels == undefined) {
      throw new NotFoundException('No channels in database');
    }
    return channels;
  }

  /*
   * Lists all channel names.
   * Only allowed for logged in users.
   */
  @Get('/chan-names/')
  @UseGuards(JwtTwoFactorGuard)
  async getChannelsNames(@Req() request: Request): Promise<string[]> {
    const channels: Channel[] = await this.channelService.getChannels();
    if (channels == undefined) {
      throw new NotFoundException('No channels in database');
    }
    return channels.map((chan) => chan.name);
  }

  @Get('/default')
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
  async getDefaultChannel(@Req() request: Request): Promise<Channel> {
    const channel: Channel = await this.channelService.getChannelById(
      1,
      request.user.id,
    );
    if (channel == undefined) {
      const generalChan: Channel = await this.channelService.seed();
      if (generalChan == undefined) {
        throw new NotFoundException("Couldn't initialize general channel");
      }
      return generalChan;
    }
    return channel;
  }

  /**
   * Returns a channel found in database by its id.
   * Mainly used to fetch messages, allowed only for channel members
   */
  @Get('/channel/:chanId')
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
    @Req() request: Request,
  ): Promise<Channel> {
    const cm: ChannelMember = await this.channelService.getChannelMember(
      chanId,
      request.user.id,
    );
    if (cm == undefined) {
      throw new ForbiddenException('You must be a member to access a channel');
    }
    const channel: Channel = await this.channelService.getChannelById(
      chanId,
      request.user.id,
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
   * Used to fetch messages for non members of a channel
   */
  @Get('/preview/:chanId')
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
  async getChannelPreview(
    @Param('chanId') chanId: number,
    @Req() request: Request,
  ): Promise<Channel> {
    const channel: Channel = await this.channelService.getChannelPreview(
      chanId,
      request.user.id,
    );
    if (channel == undefined) {
      throw new NotFoundException('Channel not found');
    }
    return channel;
  }

  /*
   * Returns true if channel name was found in DB.
   * allowed for logged in users.
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
  async getChannelByName(@Param('name') name: string): Promise<boolean> {
    const channel: Channel = await this.channelService.getChannelByName(name);
    if (channel == undefined) {
      throw new NotFoundException('Channel not found');
    }
    return true;
  }

  /**
   * Save a new channel to database from the POST body
   * Logged in users only.
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

  @Post('/dm')
  @UseGuards(JwtTwoFactorGuard)
  async saveDmChannel(
    @Body() newChannel: CreateChannelDto,
  ): Promise<ChannelMember> {
    const owner: ChannelMember = await this.channelService.saveDmChannel(
      newChannel,
    );
    if (owner == undefined) {
      throw new NotFoundException('Failed to create channel');
    }
    return owner;
  }

  @Get('/chat-message/:status/:chanId')
  @UseGuards(JwtTwoFactorGuard)
  async setNewMessage(
    @Param('status') status: string,
    @Param('chanId') chanId: number,
    @Req() request: Request,
  ): Promise<ChannelMember> {
    const cm: ChannelMember = await this.channelService.getChannelMember(
      chanId,
      request.user.id,
    );
    if (cm == undefined) {
      return undefined;
      // throw new NotFoundException('Not a member of this channel');
    } else if (!cm.notification) {
      return cm;
    }
    const bool = status == 'true' ? true : false;
    if (bool == cm.new_message) {
      return cm;
    }
    return await this.channelService.setNewMessage(bool, cm.id);
  }

  @Get('/toggle-notification/:cmId')
  @UseGuards(JwtTwoFactorGuard)
  async toggleNotification(
    @Param('cmId') cmId: number,
    @Req() request: Request,
  ): Promise<ChannelMember> {
    const cm: ChannelMember = await this.channelService.getCmById(cmId);
    if (cm == undefined) {
      throw new NotFoundException('Not a member of this channel');
    } else if (cm.member.id !== request.user.id) {
      throw new ForbiddenException(
        'Only subscribed users can change their own notification settings',
      );
    }
    return await this.channelService.toggleNotification(cm);
  }

  /**
   * Add a user as a member of a channel.
   * Logged in users only.
   * Can be called by: user themself, channel admin/owner, website admin/owner,
   * or another non blocked user if the channel is a dm
   */
  @Get('/join-channel/:type/:channel/:user')
  @UseGuards(JwtTwoFactorGuard)
  async joinChannel(
    @Param('type') type: string,
    @Param('channel') channel_id: number,
    @Param('user') user_id: number,
    @Req() request: Request,
  ): Promise<ChannelMember> {
    /*add type check :
     ** "added": check that req is a chan admin/owner
     ** "dm": check that req hasn't been blocked
     ** "self": check that user_id == request.user.id
     */
    const joinee: User = await this.channelService.getUser(user_id);
    if (joinee == undefined) {
      throw new NotFoundException('Couldnt identify user');
    }
    switch (type) {
      case 'added':
        await this.channelService
          .checkBlocked(user_id, request.user.id)
          .then((res) => {
            if (res == true && request.user.role == 'user') {
              throw new ForbiddenException(
                'Failed to join channel: missing authorization to act for this user: active block',
              );
            }
          });
        await this.channelService
          .getChannelMember(channel_id, request.user.id)
          .then(async (res) => {
            if (!res) {
              const user: User = await this.channelService.getUser(
                request.user.id,
              );
              if (user == undefined) {
                throw new NotFoundException('Couldnt identify request account');
              }
              if (user.role !== Role.ADMIN && user.role !== Role.OWNER) {
                throw new ForbiddenException(
                  'Failed to join channel: missing authorization to act for this user',
                );
              }
            } else if (
              !res.is_admin &&
              !res.is_owner &&
              res.member.role !== Role.ADMIN &&
              res.member.role != Role.OWNER
            ) {
              throw new ForbiddenException(
                'Failed to join channel: missing authorization to act for this user',
              );
            }
          });
        break;
      case 'dm':
        await this.channelService
          .checkBlocked(user_id, request.user.id)
          .then((res) => {
            if (res == true) {
              throw new ForbiddenException(
                'Failed to join channel: missing authorization to act for this user',
              );
            }
          });
        break;
      case 'self':
        if (request.user.id != user_id) {
          throw new ForbiddenException(
            'Failed to join channel: missing authorization to act for this user',
          );
        }
        break;
      default:
        throw new BadRequestException(
          'Failed to join channel: bad type for the add request',
        );
    }
    return await this.channelService
      .joinChannel(channel_id, user_id)
      .then(async (res) => {
        if (res == undefined) {
          throw new NotFoundException('Failed to join channel');
        }
        if (type == 'dm') {
          return await this.channelService.toggleNotification(res);
        } else {
          return res;
        }
      });
  }

  @Get('/join-protected/:channel/:attempt')
  @UseGuards(JwtTwoFactorGuard)
  async checkPasswordMatch(
    @Param('channel') channel_id: number,
    @Param('attempt') attempt: string,
    @Req() request: Request,
  ): Promise<boolean> {
    const match: boolean = await this.channelService.checkPasswordMatch(
      channel_id,
      request.user.id,
      attempt,
    );
    if (match == undefined) {
      throw new NotFoundException("Couldn't attempt to match password");
    }
    return match;
  }

  @Get('/user-channels')
  @UseGuards(JwtTwoFactorGuard)
  async getUserChannels(@Req() request: Request): Promise<ChannelMember[]> {
    const cm: ChannelMember[] = await this.channelService.getUserChannels(
      request.user.id,
    );
    if (cm == undefined) {
      throw new NotFoundException('No user channels found');
    }
    const user: User = await this.channelService.getUser(request.user.id);
    if (user == undefined) {
      throw new NotFoundException('Couldnt identify request account');
    }
    if (user.role == Role.ADMIN || user.role == Role.OWNER) {
      return cm;
    }
    return this.channelService.filterBanned(cm);
  }

  @Get('/avail')
  @UseGuards(JwtTwoFactorGuard)
  async getAvailableChannels(@Req() request: Request): Promise<Channel[]> {
    const channels: Channel[] = await this.channelService.getAvailableChannels(
      request.user.id,
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
      // throw new NotFoundException('Channel Member not found');
      return undefined;
    } else if (cm.ban && cm.member.role == 'user') {
      throw new ForbiddenException('banned');
    }
    return cm;
  }

  @Post('/leave-channel/:type/:cm_id')
  @UseGuards(JwtTwoFactorGuard)
  async leaveChannel(
    @Param('type') type: string,
    @Param('cm_id') cm_id: number,
    @Req() request: Request,
  ): Promise<DeleteResult> {
    const cm: ChannelMember = await this.channelService.getCmById(cm_id);
    if (cm == undefined) {
      throw new NotFoundException('Channel Member not found');
    }
    if (cm.channel.id == 1) {
      throw new ForbiddenException('Thou shalt not leave General!!');
    }
    switch (type) {
      case 'kick':
        if (cm.member.id == request.user.id) {
          throw new ForbiddenException("You can't kick yourself..!");
        }
        await this.channelService
          .getChannelMember(cm.channel.id, request.user.id)
          .then(async (res) => {
            if (!res) {
              const user: User = await this.channelService.getUser(
                request.user.id,
              );
              if (user == undefined) {
                throw new NotFoundException(
                  "Couldn't identify request account",
                );
              }
              if (user.role !== Role.ADMIN && user.role !== Role.OWNER) {
                throw new ForbiddenException(
                  'Failed to leave channel: missing authorization to act for this user',
                );
              }
            } else if (
              !res.is_admin &&
              !res.is_owner &&
              res.member.role !== Role.ADMIN &&
              res.member.role != Role.OWNER
            ) {
              throw new ForbiddenException(
                'Failed to leave channel: missing authorization to act for this user',
              );
            }
          });
        break;
      case 'self':
        if (request.user.id != cm.member.id) {
          throw new ForbiddenException(
            'Failed to leave channel: missing authorization to act for this user',
          );
        }
        break;
      default:
        throw new BadRequestException(
          'Failed to leave channel: bad type for the leave request',
        );
    }
    const dr: DeleteResult = await this.channelService.leaveChannel(cm_id);
    return dr;
  }

  @Post('/delete-channel/:chan_id')
  @UseGuards(JwtTwoFactorGuard)
  async deleteChannel(
    @Param('chan_id') chan_id: number,
    @Req() request: Request,
  ): Promise<DeleteResult> {
    if (chan_id !== 1) {
      const cm: ChannelMember = await this.channelService.getChannelMember(
        chan_id,
        request.user.id,
      );
      if (cm == undefined) {
        const user: User = await this.channelService.getUser(request.user.id);
        if (user == undefined) {
          throw new NotFoundException("Couldn't identify request account");
        }
        if (user.role !== Role.ADMIN && user.role !== Role.OWNER) {
          throw new ForbiddenException(
            'You dont have the right to delete this channel',
          );
        }
      } else if (
        cm.channel.name == 'General' ||
        (!cm.is_owner &&
          cm.member.role !== Role.OWNER &&
          cm.member.role !== Role.ADMIN)
      ) {
        throw new ForbiddenException(
          'You dont have the right to delete this channel',
        );
      }

      const dr: DeleteResult = await this.channelService.deleteChannel(chan_id);
      return dr;
    } else throw new ForbiddenException("General can't be deleted");
  }

  @Get('/admin-action/:action/:cm_id/:end_date')
  @UseGuards(JwtTwoFactorGuard)
  async muteBanMember(
    @Param('action') action: string,
    @Param('cm_id') cm_id: number,
    @Param('end_date') end_date: number,
    @Req() request: Request,
  ): Promise<ChannelMember> {
    if (end_date.toString() !== '0' && !Number(end_date)) {
      throw new BadRequestException('Bad date format!');
    }
    const user_cm: ChannelMember = await this.channelService.getCmById(cm_id);
    if (user_cm == undefined) {
      throw new NotFoundException('Failed to find this member');
    }
    if (end_date.toString() !== '0') {
      if (action == 'unban' && end_date.toString() !== user_cm.ban) {
        return undefined;
      } else if (action == 'unmute' && end_date.toString() !== user_cm.mute) {
        return undefined;
      }
    }

    if (action == 'unban' && !user_cm.ban) {
      throw new BadRequestException("This member isn't banned");
    } else if (action == 'unmute' && !user_cm.mute) {
      throw new BadRequestException("This member isn't muted");
    } else if (action == 'muted' && user_cm.mute) {
      throw new BadRequestException('This member is already muted');
    } else if (action == 'banned' && user_cm.ban) {
      throw new BadRequestException('This member is already banned');
    }
    if (
      (action == 'banned' || action == 'muted') &&
      user_cm.member.id == request.user.id
    ) {
      throw new ForbiddenException("You can't mute or ban yourself..!");
    }
    if (action == 'banned' && user_cm.channel.name == 'General') {
      throw new ForbiddenException("Can't ban a user from General!");
    }
    const req_cm: ChannelMember = await this.channelService.getChannelMember(
      user_cm.channel.id,
      request.user.id,
    );
    if (req_cm == undefined) {
      const user: User = await this.channelService.getUser(request.user.id);
      if (user == undefined) {
        throw new NotFoundException("Couldn't identify request account");
      }
      if (user.role !== Role.ADMIN && user.role !== Role.OWNER) {
        throw new ForbiddenException(
          "You don't have the right to act on this channels members",
        );
      }
    } else if (
      !req_cm.is_admin &&
      !req_cm.is_owner &&
      req_cm.member.role !== Role.ADMIN &&
      req_cm.member.role !== Role.OWNER
    ) {
      throw new ForbiddenException(
        "You don't have the right to act on this channels members",
      );
    }

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
  async toggleAdmin(
    @Param('cm_id') cm_id: number,
    @Req() request: Request,
  ): Promise<ChannelMember> {
    const user_cm: ChannelMember = await this.channelService.getCmById(cm_id);
    if (user_cm == undefined) {
      throw new NotFoundException('Failed to find member');
    }
    const req_cm: ChannelMember = await this.channelService.getChannelMember(
      user_cm.channel.id,
      request.user.id,
    );
    if (req_cm == undefined) {
      const user: User = await this.channelService.getUser(request.user.id);
      if (user == undefined) {
        throw new NotFoundException('Couldnt identify request account');
      }
      if (user.role !== Role.ADMIN && user.role !== Role.OWNER) {
        throw new ForbiddenException(
          'You dont have the right to act on this channels members',
        );
      }
    } else if (
      !req_cm.is_owner &&
      (!req_cm.is_admin || user_cm.member.id !== request.user.id) &&
      req_cm.member.role !== Role.ADMIN &&
      req_cm.member.role !== Role.OWNER
    ) {
      throw new ForbiddenException(
        'You dont have the right to act on this channels members',
      );
    }

    const cm: ChannelMember = await this.channelService.toggleAdmin(cm_id);
    if (cm == undefined) {
      throw new NotFoundException("Failed to edit member's admin status");
    }
    return cm;
  }

  @Get('/update-pwd/:chan_id/:pwd')
  @UseGuards(JwtTwoFactorGuard)
  async updateChannelPassword(
    @Param('chan_id') chan_id: number,
    @Param('pwd') pwd: string,
    @Req() request: Request,
  ): Promise<Channel> {
    const req_cm: ChannelMember = await this.channelService.getChannelMember(
      chan_id,
      request.user.id,
    );
    if (req_cm == undefined) {
      const user: User = await this.channelService.getUser(request.user.id);
      if (user == undefined) {
        throw new NotFoundException("Couldn't identify request account");
      }
      if (user.role !== Role.ADMIN && user.role !== Role.OWNER) {
        throw new ForbiddenException(
          'You dont have the right to delete this channel',
        );
      }
    } else if (!req_cm.is_owner && req_cm.member.role == Role.USER) {
      throw new ForbiddenException(
        'You dont have the right to edit this channel',
      );
    }

    const channel: Channel = await this.channelService.updateChannelPassword(
      chan_id,
      request.user.id,
      pwd,
    );
    if (channel == undefined) {
      throw new NotFoundException('Failed to edit channel password');
    }
    return channel;
  }
}
