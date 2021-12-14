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
exports.ChannelsService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const channels_entity_1 = require('./entity/channels.entity');
const users_module_1 = require('../users/users.module');
const bcrypt = require('bcrypt');
const users_entity_1 = require('../users/entity/users.entity');
const channel_members_service_1 = require('../channel_members/channel_members.service');
const channel_member_interface_1 = require('../channel_members/interfaces/channel_member.interface');
const relationships_service_1 = require('../relationships/relationships.service');
const role_enum_1 = require('../auth/models/role.enum');
const channel_members_entity_1 = require('../channel_members/entity/channel_members.entity');
const messages_entity_1 = require('../messages/entity/messages.entity');
const user_interface_1 = require('../users/interfaces/user.interface');
let ChannelsService = class ChannelsService {
  constructor(
    channelsRepository,
    userService,
    channelMemberService,
    relationshipService,
  ) {
    this.channelsRepository = channelsRepository;
    this.userService = userService;
    this.channelMemberService = channelMemberService;
    this.relationshipService = relationshipService;
  }
  async seed() {
    console.log('Initializing default channel...');
    return await this.channelsRepository
      .save({
        id: 1,
        name: 'General',
        password: null,
        type: 'public',
      })
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Channel did not comply database requirements',
        );
      });
  }
  async getChannels() {
    return await this.channelsRepository.find();
  }
  async getChannelByName(name) {
    const channel = await this.channelsRepository.findOne({
      where: { name: name },
    });
    return channel;
  }
  async getChannelsByName(name) {
    const channels = await this.channelsRepository.find({
      where: { name: name },
    });
    return channels;
  }
  async getUser(user_id) {
    return await this.userService.getUserbyId(user_id);
  }
  async getNotifications(userId) {
    const user = await this.userService.getUserbyId(userId);
    if (user == undefined) {
      return undefined;
    }
    let cms = await this.channelMemberService.getUserChannels(user);
    if (cms == undefined) {
      return undefined;
    }
    cms = cms.filter((cms) => cms.new_message);
    if (cms.length) {
      return true;
    } else {
      return false;
    }
  }
  async getNewNotification(data, userId) {
    const cms = await this.getChannelMember(data.channel.id, userId);
    if (cms == undefined || cms.ban || !cms.notification) {
      return false;
    }
    return await this.relationshipService
      .getBlockedByUser(userId)
      .then(async (blocked) => {
        if (
          blocked.map((blocked) => blocked.adresseeId).includes(data.author.id)
        ) {
          return false;
        }
        return await this.channelMemberService
          .setNewMessage(true, cms.id)
          .then((res) => {
            if (res) {
              return res.new_message;
            }
            return false;
          })
          .catch((err) => {
            return false;
          });
      });
  }
  async getChannelMember(channel_id, user_id) {
    const channel = await this.getChannelById(channel_id, user_id);
    const user = await this.userService.getUserbyId(user_id);
    return await this.channelMemberService.getChannelMember(channel, user);
  }
  async setNewMessage(status, cmId) {
    return await this.channelMemberService.setNewMessage(status, cmId);
  }
  async toggleNotification(cm) {
    return await this.channelMemberService.toggleNotification(cm.id);
  }
  async notifyOfflineUsers(message, onlineUsers) {
    await this.channelsRepository
      .findOne(message.channel.id)
      .then((channel) => {
        if (channel == undefined) {
          return;
        }
        const chanMembers = channel.channel_members;
        const onlineMemberIds = onlineUsers.map((user) => user.id);
        const offlineMembers = chanMembers.filter(
          (cm) => !onlineMemberIds.includes(cm.member.id),
        );
        offlineMembers.forEach((cm) => {
          this.channelMemberService.setNewMessage(true, cm.id);
        });
      })
      .catch((err) => console.log('Caught error:', err));
  }
  async getCmById(cm_id) {
    return await this.channelMemberService.getChannelMemberById(cm_id);
  }
  async checkBlocked(user_id, blocked_id) {
    return await this.relationshipService
      .getUserBlocked(user_id)
      .then((res) => {
        if (
          res &&
          (res.map((res) => res.adresseeId).includes(blocked_id) ||
            res.map((res) => res.requesterId).includes(blocked_id))
        ) {
          return true;
        }
        return false;
      });
  }
  async filterBanned(userChannels) {
    return userChannels.filter((userChannels) => !userChannels.ban);
  }
  async filterBlocked(user, userChannels) {
    return await this.relationshipService
      .getBlockedByUser(user.id)
      .then((res) => {
        userChannels.forEach((cm) => {
          if (res && cm.channel.messages) {
            cm.channel.messages = cm.channel.messages.filter(
              (msg) =>
                !res.map((res) => res.adresseeId).includes(msg.author.id),
            );
            cm.channel.messages.sort((a, b) => a.id - b.id);
          }
          if (res && cm.channel.channel_members) {
            cm.channel.channel_members = cm.channel.channel_members.filter(
              (member) =>
                !res.map((res) => res.adresseeId).includes(member.member.id),
            );
          }
        });
        return userChannels;
      });
  }
  async filterBlockedInAvail(userId, channels) {
    return await this.relationshipService
      .getBlockedByUser(userId)
      .then((res) => {
        channels.forEach((chan) => {
          if (chan.messages && res) {
            chan.messages = chan.messages.filter(
              (msg) =>
                !res.map((res) => res.adresseeId).includes(msg.author.id),
            );
          }
          if (chan.channel_members && res) {
            chan.channel_members = chan.channel_members.filter(
              (member) =>
                !res.map((res) => res.adresseeId).includes(member.member.id),
            );
          }
        });
        return channels;
      });
  }
  async getUserChannels(user_id) {
    const user = await this.userService.getUserbyId(user_id);
    return await this.channelMemberService
      .getUserChannels(user)
      .then(async (res) => {
        return await this.filterBlocked(user, res);
      });
  }
  async getAvailableChannels(user_id) {
    const user = await this.getUser(user_id);
    if (user == undefined) {
      return undefined;
    }
    let channels = await this.getChannels();
    return await this.getUserChannels(user_id).then(async (res) => {
      const userChannels = res.map((cm) => cm.channel);
      channels = channels.filter(
        (channels) =>
          !userChannels
            .map((userChannels) => userChannels.id)
            .includes(channels.id),
      );
      if (
        user.role == role_enum_1.Role.OWNER ||
        user.role == role_enum_1.Role.ADMIN
      ) {
        return await this.filterBlockedInAvail(user_id, channels);
      }
      channels = channels.filter((channels) => channels.type === 'public');
      channels.forEach((channel) => {
        if (channel.password) {
          channel.messages = [];
        } else if (channel.messages) {
          channel.messages.sort((a, b) => a.id - b.id);
        }
      });
      return await this.filterBlockedInAvail(user_id, channels);
    });
  }
  async getChannelById(chanId, userId) {
    return await this.channelsRepository
      .findOne(chanId, {
        relations: ['messages', 'channel_members'],
      })
      .then(async (channel) => {
        if (channel == undefined) {
          return undefined;
        }
        return await this.relationshipService
          .getBlockedByUser(userId)
          .then((blocked) => {
            if (channel.messages && blocked) {
              channel.messages = channel.messages.filter(
                (msg) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(msg.author.id),
              );
            }
            if (channel.channel_members && blocked) {
              channel.channel_members = channel.channel_members.filter(
                (member) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(member.member.id),
              );
            }
            if (channel.messages) {
              channel.messages.sort((a, b) => a.id - b.id);
            }
            return channel;
          });
      });
  }
  async getChannelPreview(chanId, userId) {
    const user = await this.getUser(userId);
    if (user == undefined) {
      return undefined;
    }
    return await this.channelsRepository
      .findOne(chanId, {
        relations: ['messages'],
      })
      .then(async (channel) => {
        if (channel == undefined) {
          return undefined;
        }
        if (user.role == role_enum_1.Role.USER && channel.type == 'private') {
          return undefined;
        } else if (user.role == role_enum_1.Role.USER && channel.password) {
          channel.messages = [];
          return channel;
        }
        return await this.relationshipService
          .getBlockedByUser(userId)
          .then((blocked) => {
            if (channel.messages && blocked) {
              channel.messages = channel.messages.filter(
                (msg) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(msg.author.id),
              );
            }
            if (channel.channel_members && blocked) {
              channel.channel_members = channel.channel_members.filter(
                (member) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(member.member.id),
              );
            }
            if (channel.messages) {
              channel.messages.sort((a, b) => a.id - b.id);
            }
            return channel;
          });
      });
  }
  async checkPasswordMatch(channel_id, user_id, attempt) {
    const channel = await this.getChannelById(channel_id, user_id);
    const ret = await bcrypt.compare(attempt, channel.password);
    return await ret;
  }
  async joinChannel(channel_id, user_id) {
    const channel = await this.getChannelById(channel_id, user_id);
    const user = await this.userService.getUserbyId(user_id);
    const cm = await this.channelMemberService.getChannelMember(channel, user);
    if (cm) {
      return await cm;
    }
    return await this.channelMemberService.createChannelMember(channel, user);
  }
  async leaveChannel(cm_id) {
    const cm = await this.channelMemberService.getChannelMemberById(cm_id);
    if (cm == undefined) {
      return;
    }
    return await this.channelMemberService
      .deleteChannelMember(cm_id)
      .then(async (res) => {
        if (
          cm.channel.channel_members.length == 1 &&
          cm.channel.type == 'private'
        ) {
          return await this.deleteChannel(cm.channel.id);
        }
      });
  }
  async deleteChannel(chan_id) {
    return await this.channelsRepository
      .delete(chan_id)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Channel did not comply database requirements',
        );
      });
  }
  async saveDmChannel(dmInfo) {
    if (dmInfo.owner_id == dmInfo.recipient_id) {
      throw new common_1.BadRequestException("You can't dm yourself!");
    }
    const split = dmInfo.name.split(' ');
    if (split.length !== 3) {
      throw new common_1.BadRequestException('Bad dm name format!');
    }
    return await this.getChannelsByName(dmInfo.name).then(async (res) => {
      if (res) {
        res.forEach((chan) => {
          if (
            chan.channel_members.length == 2 &&
            ((chan.channel_members[0].member.id == dmInfo.owner_id &&
              chan.channel_members[1].member.id == dmInfo.recipient_id) ||
              (chan.channel_members[1].member.id == dmInfo.owner_id &&
                chan.channel_members[0].member.id == dmInfo.recipient_id))
          ) {
            throw new common_1.BadRequestException(
              'DM channel already exists!',
            );
          }
        });
      }
      const altName = split[2] + ' ' + split[1] + ' ' + split[0];
      return await this.getChannelsByName(altName).then(async (res) => {
        if (res) {
          res.forEach((chan) => {
            if (
              chan.channel_members.length == 2 &&
              ((chan.channel_members[0].member.id == dmInfo.owner_id &&
                chan.channel_members[1].member.id == dmInfo.recipient_id) ||
                (chan.channel_members[1].member.id == dmInfo.owner_id &&
                  chan.channel_members[0].member.id == dmInfo.recipient_id))
            ) {
              throw new common_1.BadRequestException(
                'DM channel already exists!',
              );
            }
          });
        }
        return await this.checkBlocked(
          dmInfo.owner_id,
          dmInfo.recipient_id,
        ).then(async (res) => {
          if (res == true) {
            throw new common_1.ForbiddenException(
              'Failed to create DM: active block',
            );
          }
          const recipient = await this.userService.getUserbyId(
            dmInfo.recipient_id,
          );
          const owner = await this.userService.getUserbyId(dmInfo.owner_id);
          if (recipient == undefined || owner == undefined) {
            throw new common_1.ForbiddenException(
              'Failed to create DM: unknown recipient or sender',
            );
          }
          return await this.channelsRepository
            .save(dmInfo)
            .then(async (res) => {
              await this.channelMemberService.createChannelMember(
                res,
                recipient,
                true,
                true,
                dmInfo.notification,
              );
              return await this.channelMemberService.createChannelMember(
                res,
                owner,
                true,
                true,
                dmInfo.notification,
              );
            })
            .catch(() => {
              throw new common_1.BadRequestException(
                'Channel did not comply database requirements',
              );
            });
        });
      });
    });
  }
  async saveChannel(channelDto) {
    const newChannel = this.channelsRepository.create(channelDto);
    const owner = await this.userService.getUserbyId(channelDto.owner_id);
    if (newChannel.password) {
      const salt = await bcrypt.genSalt();
      newChannel.password = await bcrypt.hash(channelDto.password, salt);
    }
    return await this.getChannelByName(channelDto.name).then(async (res) => {
      if (res) {
        throw new common_1.BadRequestException('Channel name already exists!');
      }
      return await this.channelsRepository
        .save(newChannel)
        .then(async (res) => {
          return await this.channelMemberService.createChannelMember(
            res,
            owner,
            true,
            true,
            channelDto.notification,
          );
        })
        .catch(() => {
          throw new common_1.BadRequestException(
            'Channel did not comply database requirements',
          );
        });
    });
  }
  async muteBanMember(action, cm_id, end_date) {
    return await this.channelMemberService.muteBanMember(
      action,
      cm_id,
      end_date,
    );
  }
  async toggleAdmin(cm_id) {
    return await this.channelMemberService.toggleAdmin(cm_id);
  }
  async updateChannelPassword(chan_id, user_id, pwd) {
    const channel = await this.getChannelById(chan_id, user_id);
    if (pwd != 'null') {
      const salt = await bcrypt.genSalt();
      channel.password = await bcrypt.hash(pwd, salt);
    } else {
      channel.password = '';
    }
    return await this.channelsRepository
      .save(channel)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Channel did not comply database requirements',
        );
      });
  }
};
ChannelsService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(channels_entity_1.Channels)),
    __metadata('design:paramtypes', [
      typeorm_2.Repository,
      users_module_1.UsersService,
      channel_members_service_1.ChannelMembersService,
      relationships_service_1.RelationshipsService,
    ]),
  ],
  ChannelsService,
);
exports.ChannelsService = ChannelsService;
//# sourceMappingURL=channels.service.js.map
