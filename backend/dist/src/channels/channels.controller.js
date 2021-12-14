'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ChannelsController = void 0;
const openapi = require('@nestjs/swagger');
const common_1 = require('@nestjs/common');
const channels_service_1 = require('./channels.service');
const channel_interface_1 = require('./interfaces/channel.interface');
const createChannel_dto_1 = require('./dto/createChannel.dto');
const swagger_1 = require('@nestjs/swagger');
const channel_member_interface_1 = require('../channel_members/interfaces/channel_member.interface');
const jwtTwoFactor_guard_1 = require('../auth/guards/jwtTwoFactor.guard');
const roles_decorator_1 = require('../auth/decorators/roles.decorator');
const role_enum_1 = require('../auth/models/role.enum');
const roles_guard_1 = require('../auth/guards/roles.guard');
const user_interface_1 = require('../users/interfaces/user.interface');
let ChannelsController = class ChannelsController {
  constructor(channelService) {
    this.channelService = channelService;
  }
  async getChannels(request) {
    const channels = await this.channelService.getChannels();
    if (channels == undefined) {
      throw new common_1.NotFoundException('No channels in database');
    }
    return channels;
  }
  async getChannelsNames(request) {
    const channels = await this.channelService.getChannels();
    if (channels == undefined) {
      throw new common_1.NotFoundException('No channels in database');
    }
    return channels.map((chan) => chan.name);
  }
  async getDefaultChannel(request) {
    const channel = await this.channelService.getChannelById(
      1,
      request.user.id,
    );
    if (channel == undefined) {
      const generalChan = await this.channelService.seed();
      if (generalChan == undefined) {
        throw new common_1.NotFoundException(
          "Couldn't initialize general channel",
        );
      }
      return generalChan;
    }
    return channel;
  }
  async getChannelById(chanId, request) {
    const cm = await this.channelService.getChannelMember(
      chanId,
      request.user.id,
    );
    if (cm == undefined) {
      throw new common_1.ForbiddenException(
        'You must be a member to access a channel',
      );
    }
    const channel = await this.channelService.getChannelById(
      chanId,
      request.user.id,
    );
    if (channel == undefined) {
      if (chanId == 1) {
        const generalChan = await this.channelService.seed();
        if (generalChan == undefined) {
          throw new common_1.NotFoundException(
            "Couldn't initialize general channel",
          );
        }
        return generalChan;
      }
      throw new common_1.NotFoundException('Channel not found');
    }
    return channel;
  }
  async getChannelPreview(chanId, request) {
    const channel = await this.channelService.getChannelPreview(
      chanId,
      request.user.id,
    );
    if (channel == undefined) {
      throw new common_1.NotFoundException('Channel not found');
    }
    return channel;
  }
  async getChannelByName(name) {
    const channel = await this.channelService.getChannelByName(name);
    if (channel == undefined) {
      throw new common_1.NotFoundException('Channel not found');
    }
    return true;
  }
  async saveChannel(newChannel) {
    const owner = await this.channelService.saveChannel(newChannel);
    if (owner == undefined) {
      throw new common_1.NotFoundException('Failed to create channel');
    }
    return owner;
  }
  async saveDmChannel(newChannel) {
    const owner = await this.channelService.saveDmChannel(newChannel);
    if (owner == undefined) {
      throw new common_1.NotFoundException('Failed to create channel');
    }
    return owner;
  }
  async setNewMessage(status, chanId, request) {
    const cm = await this.channelService.getChannelMember(
      chanId,
      request.user.id,
    );
    if (cm == undefined) {
      return undefined;
    } else if (!cm.notification) {
      return cm;
    }
    const bool = status == 'true' ? true : false;
    if (bool == cm.new_message) {
      return cm;
    }
    return await this.channelService.setNewMessage(bool, cm.id);
  }
  async toggleNotification(cmId, request) {
    const cm = await this.channelService.getCmById(cmId);
    if (cm == undefined) {
      throw new common_1.NotFoundException('Not a member of this channel');
    } else if (cm.member.id !== request.user.id) {
      throw new common_1.ForbiddenException(
        'Only subscribed users can change their own notification settings',
      );
    }
    return await this.channelService.toggleNotification(cm);
  }
  async joinChannel(type, channel_id, user_id, request) {
    const joinee = await this.channelService.getUser(user_id);
    if (joinee == undefined) {
      throw new common_1.NotFoundException('Couldnt identify user');
    }
    switch (type) {
      case 'added':
        await this.channelService
          .checkBlocked(user_id, request.user.id)
          .then((res) => {
            if (res == true && request.user.role == 'user') {
              throw new common_1.ForbiddenException(
                'Failed to join channel: missing authorization to act for this user: active block',
              );
            }
          });
        await this.channelService
          .getChannelMember(channel_id, request.user.id)
          .then(async (res) => {
            if (!res) {
              const user = await this.channelService.getUser(request.user.id);
              if (user == undefined) {
                throw new common_1.NotFoundException(
                  'Couldnt identify request account',
                );
              }
              if (
                user.role !== role_enum_1.Role.ADMIN &&
                user.role !== role_enum_1.Role.OWNER
              ) {
                throw new common_1.ForbiddenException(
                  'Failed to join channel: missing authorization to act for this user',
                );
              }
            } else if (
              !res.is_admin &&
              !res.is_owner &&
              res.member.role !== role_enum_1.Role.ADMIN &&
              res.member.role != role_enum_1.Role.OWNER
            ) {
              throw new common_1.ForbiddenException(
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
              throw new common_1.ForbiddenException(
                'Failed to join channel: missing authorization to act for this user',
              );
            }
          });
        break;
      case 'self':
        if (request.user.id != user_id) {
          throw new common_1.ForbiddenException(
            'Failed to join channel: missing authorization to act for this user',
          );
        }
        break;
      default:
        throw new common_1.BadRequestException(
          'Failed to join channel: bad type for the add request',
        );
    }
    return await this.channelService
      .joinChannel(channel_id, user_id)
      .then(async (res) => {
        if (res == undefined) {
          throw new common_1.NotFoundException('Failed to join channel');
        }
        if (type == 'dm') {
          return await this.channelService.toggleNotification(res);
        } else {
          return res;
        }
      });
  }
  async checkPasswordMatch(channel_id, attempt, request) {
    const match = await this.channelService.checkPasswordMatch(
      channel_id,
      request.user.id,
      attempt,
    );
    if (match == undefined) {
      throw new common_1.NotFoundException(
        "Couldn't attempt to match password",
      );
    }
    return match;
  }
  async getUserChannels(request) {
    const cm = await this.channelService.getUserChannels(request.user.id);
    if (cm == undefined) {
      throw new common_1.NotFoundException('No user channels found');
    }
    const user = await this.channelService.getUser(request.user.id);
    if (user == undefined) {
      throw new common_1.NotFoundException('Couldnt identify request account');
    }
    if (
      user.role == role_enum_1.Role.ADMIN ||
      user.role == role_enum_1.Role.OWNER
    ) {
      return cm;
    }
    return this.channelService.filterBanned(cm);
  }
  async getAvailableChannels(request) {
    const channels = await this.channelService.getAvailableChannels(
      request.user.id,
    );
    if (channels == undefined) {
      throw new common_1.NotFoundException('No available channels found');
    }
    return channels;
  }
  async getChannelMember(channel_id, user_id) {
    const cm = await this.channelService.getChannelMember(channel_id, user_id);
    if (cm == undefined) {
      return undefined;
    } else if (cm.ban && cm.member.role == 'user') {
      throw new common_1.ForbiddenException('banned');
    }
    return cm;
  }
  async leaveChannel(type, cm_id, request) {
    const cm = await this.channelService.getCmById(cm_id);
    if (cm == undefined) {
      throw new common_1.NotFoundException('Channel Member not found');
    }
    if (cm.channel.id == 1) {
      throw new common_1.ForbiddenException('Thou shalt not leave General!!');
    }
    switch (type) {
      case 'kick':
        if (cm.member.id == request.user.id) {
          throw new common_1.ForbiddenException("You can't kick yourself..!");
        }
        await this.channelService
          .getChannelMember(cm.channel.id, request.user.id)
          .then(async (res) => {
            if (!res) {
              const user = await this.channelService.getUser(request.user.id);
              if (user == undefined) {
                throw new common_1.NotFoundException(
                  "Couldn't identify request account",
                );
              }
              if (
                user.role !== role_enum_1.Role.ADMIN &&
                user.role !== role_enum_1.Role.OWNER
              ) {
                throw new common_1.ForbiddenException(
                  'Failed to leave channel: missing authorization to act for this user',
                );
              }
            } else if (
              !res.is_admin &&
              !res.is_owner &&
              res.member.role !== role_enum_1.Role.ADMIN &&
              res.member.role != role_enum_1.Role.OWNER
            ) {
              throw new common_1.ForbiddenException(
                'Failed to leave channel: missing authorization to act for this user',
              );
            }
          });
        break;
      case 'self':
        if (request.user.id != cm.member.id) {
          throw new common_1.ForbiddenException(
            'Failed to leave channel: missing authorization to act for this user',
          );
        }
        break;
      default:
        throw new common_1.BadRequestException(
          'Failed to leave channel: bad type for the leave request',
        );
    }
    const dr = await this.channelService.leaveChannel(cm_id);
    return dr;
  }
  async deleteChannel(chan_id, request) {
    if (chan_id !== 1) {
      const cm = await this.channelService.getChannelMember(
        chan_id,
        request.user.id,
      );
      if (cm == undefined) {
        const user = await this.channelService.getUser(request.user.id);
        if (user == undefined) {
          throw new common_1.NotFoundException(
            "Couldn't identify request account",
          );
        }
        if (
          user.role !== role_enum_1.Role.ADMIN &&
          user.role !== role_enum_1.Role.OWNER
        ) {
          throw new common_1.ForbiddenException(
            'You dont have the right to delete this channel',
          );
        }
      } else if (
        cm.channel.name == 'General' ||
        (!cm.is_owner &&
          cm.member.role !== role_enum_1.Role.OWNER &&
          cm.member.role !== role_enum_1.Role.ADMIN)
      ) {
        throw new common_1.ForbiddenException(
          'You dont have the right to delete this channel',
        );
      }
      const dr = await this.channelService.deleteChannel(chan_id);
      return dr;
    } else throw new common_1.ForbiddenException("General can't be deleted");
  }
  async muteBanMember(action, cm_id, end_date, request) {
    if (end_date.toString() !== '0' && !Number(end_date)) {
      throw new common_1.BadRequestException('Bad date format!');
    }
    const user_cm = await this.channelService.getCmById(cm_id);
    if (user_cm == undefined) {
      throw new common_1.NotFoundException('Failed to find this member');
    }
    if (end_date.toString() !== '0') {
      if (action == 'unban' && end_date.toString() !== user_cm.ban) {
        return undefined;
      } else if (action == 'unmute' && end_date.toString() !== user_cm.mute) {
        return undefined;
      }
    }
    if (action == 'unban' && !user_cm.ban) {
      throw new common_1.BadRequestException("This member isn't banned");
    } else if (action == 'unmute' && !user_cm.mute) {
      throw new common_1.BadRequestException("This member isn't muted");
    } else if (action == 'muted' && user_cm.mute) {
      throw new common_1.BadRequestException('This member is already muted');
    } else if (action == 'banned' && user_cm.ban) {
      throw new common_1.BadRequestException('This member is already banned');
    }
    if (
      (action == 'banned' || action == 'muted') &&
      user_cm.member.id == request.user.id
    ) {
      throw new common_1.ForbiddenException(
        "You can't mute or ban yourself..!",
      );
    }
    if (action == 'banned' && user_cm.channel.name == 'General') {
      throw new common_1.ForbiddenException("Can't ban a user from General!");
    }
    const req_cm = await this.channelService.getChannelMember(
      user_cm.channel.id,
      request.user.id,
    );
    if (req_cm == undefined) {
      const user = await this.channelService.getUser(request.user.id);
      if (user == undefined) {
        throw new common_1.NotFoundException(
          "Couldn't identify request account",
        );
      }
      if (
        user.role !== role_enum_1.Role.ADMIN &&
        user.role !== role_enum_1.Role.OWNER
      ) {
        throw new common_1.ForbiddenException(
          "You don't have the right to act on this channels members",
        );
      }
    } else if (
      !req_cm.is_admin &&
      !req_cm.is_owner &&
      req_cm.member.role !== role_enum_1.Role.ADMIN &&
      req_cm.member.role !== role_enum_1.Role.OWNER
    ) {
      throw new common_1.ForbiddenException(
        "You don't have the right to act on this channels members",
      );
    }
    const cm = await this.channelService.muteBanMember(action, cm_id, end_date);
    if (cm == undefined) {
      throw new common_1.NotFoundException(
        "Failed to edit member's mute/ban status",
      );
    }
    return cm;
  }
  async toggleAdmin(cm_id, request) {
    const user_cm = await this.channelService.getCmById(cm_id);
    if (user_cm == undefined) {
      throw new common_1.NotFoundException('Failed to find member');
    }
    const req_cm = await this.channelService.getChannelMember(
      user_cm.channel.id,
      request.user.id,
    );
    if (req_cm == undefined) {
      const user = await this.channelService.getUser(request.user.id);
      if (user == undefined) {
        throw new common_1.NotFoundException(
          'Couldnt identify request account',
        );
      }
      if (
        user.role !== role_enum_1.Role.ADMIN &&
        user.role !== role_enum_1.Role.OWNER
      ) {
        throw new common_1.ForbiddenException(
          'You dont have the right to act on this channels members',
        );
      }
    } else if (
      !req_cm.is_owner &&
      (!req_cm.is_admin || user_cm.member.id !== request.user.id) &&
      req_cm.member.role !== role_enum_1.Role.ADMIN &&
      req_cm.member.role !== role_enum_1.Role.OWNER
    ) {
      throw new common_1.ForbiddenException(
        'You dont have the right to act on this channels members',
      );
    }
    const cm = await this.channelService.toggleAdmin(cm_id);
    if (cm == undefined) {
      throw new common_1.NotFoundException(
        "Failed to edit member's admin status",
      );
    }
    return cm;
  }
  async updateChannelPassword(chan_id, pwd, request) {
    const req_cm = await this.channelService.getChannelMember(
      chan_id,
      request.user.id,
    );
    if (req_cm == undefined) {
      const user = await this.channelService.getUser(request.user.id);
      if (user == undefined) {
        throw new common_1.NotFoundException(
          "Couldn't identify request account",
        );
      }
      if (
        user.role !== role_enum_1.Role.ADMIN &&
        user.role !== role_enum_1.Role.OWNER
      ) {
        throw new common_1.ForbiddenException(
          'You dont have the right to delete this channel',
        );
      }
    } else if (
      !req_cm.is_owner &&
      req_cm.member.role == role_enum_1.Role.USER
    ) {
      throw new common_1.ForbiddenException(
        'You dont have the right to edit this channel',
      );
    }
    const channel = await this.channelService.updateChannelPassword(
      chan_id,
      request.user.id,
      pwd,
    );
    if (channel == undefined) {
      throw new common_1.NotFoundException('Failed to edit channel password');
    }
    return channel;
  }
};
__decorate(
  [
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(
      role_enum_1.Role.ADMIN,
      role_enum_1.Role.OWNER,
    ),
    (0, common_1.UseGuards)(
      jwtTwoFactor_guard_1.JwtTwoFactorGuard,
      roles_guard_1.RolesGuard,
    ),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/channel.interface').Channel],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getChannels',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/chan-names/'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200, type: [String] }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getChannelsNames',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/default'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    (0, swagger_1.ApiOkResponse)({
      description: 'The channel has been found in database',
      type: channel_interface_1.Channel,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
      description: 'Channel not found',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
      description: 'Invalid ID supplied',
    }),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/channel.interface').Channel,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getDefaultChannel',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/channel/:chanId'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    (0, swagger_1.ApiOkResponse)({
      description: 'The channel has been found in database',
      type: channel_interface_1.Channel,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
      description: 'Channel not found',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
      description: 'Invalid ID supplied',
    }),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/channel.interface').Channel,
    }),
    __param(0, (0, common_1.Param)('chanId')),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getChannelById',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/preview/:chanId'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    (0, swagger_1.ApiOkResponse)({
      description: 'The channel has been found in database',
      type: channel_interface_1.Channel,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
      description: 'Channel not found',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
      description: 'Invalid ID supplied',
    }),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/channel.interface').Channel,
    }),
    __param(0, (0, common_1.Param)('chanId')),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getChannelPreview',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/name/:name'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    (0, swagger_1.ApiOkResponse)({
      description: 'The channel has been found in database',
      type: channel_interface_1.Channel,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
      description: 'Channel not found',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
      description: 'Invalid ID supplied',
    }),
    openapi.ApiResponse({ status: 200, type: Boolean }),
    __param(0, (0, common_1.Param)('name')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getChannelByName',
  null,
);
__decorate(
  [
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 201,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [createChannel_dto_1.CreateChannelDto]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'saveChannel',
  null,
);
__decorate(
  [
    (0, common_1.Post)('/dm'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 201,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [createChannel_dto_1.CreateChannelDto]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'saveDmChannel',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/chat-message/:status/:chanId'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Param)('status')),
    __param(1, (0, common_1.Param)('chanId')),
    __param(2, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'setNewMessage',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/toggle-notification/:cmId'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Param)('cmId')),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'toggleNotification',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/join-channel/:type/:channel/:user'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('channel')),
    __param(2, (0, common_1.Param)('user')),
    __param(3, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'joinChannel',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/join-protected/:channel/:attempt'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200, type: Boolean }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Param)('attempt')),
    __param(2, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'checkPasswordMatch',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/user-channels'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: [
        require('../channel_members/interfaces/channel_member.interface')
          .ChannelMember,
      ],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getUserChannels',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/avail'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: [require('./interfaces/channel.interface').Channel],
    }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getAvailableChannels',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/channel-member/:channel/:user'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Param)('channel')),
    __param(1, (0, common_1.Param)('user')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Number]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'getChannelMember',
  null,
);
__decorate(
  [
    (0, common_1.Post)('/leave-channel/:type/:cm_id'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('type')),
    __param(1, (0, common_1.Param)('cm_id')),
    __param(2, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'leaveChannel',
  null,
);
__decorate(
  [
    (0, common_1.Post)('/delete-channel/:chan_id'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Param)('chan_id')),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'deleteChannel',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/admin-action/:action/:cm_id/:end_date'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Param)('action')),
    __param(1, (0, common_1.Param)('cm_id')),
    __param(2, (0, common_1.Param)('end_date')),
    __param(3, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [String, Number, Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'muteBanMember',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/toggle-admin/:cm_id'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../channel_members/interfaces/channel_member.interface')
        .ChannelMember,
    }),
    __param(0, (0, common_1.Param)('cm_id')),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'toggleAdmin',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/update-pwd/:chan_id/:pwd'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('./interfaces/channel.interface').Channel,
    }),
    __param(0, (0, common_1.Param)('chan_id')),
    __param(1, (0, common_1.Param)('pwd')),
    __param(2, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number, String, Object]),
    __metadata('design:returntype', Promise),
  ],
  ChannelsController.prototype,
  'updateChannelPassword',
  null,
);
ChannelsController = __decorate(
  [
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('channels'),
    __metadata('design:paramtypes', [channels_service_1.ChannelsService]),
  ],
  ChannelsController,
);
exports.ChannelsController = ChannelsController;
//# sourceMappingURL=channels.controller.js.map
