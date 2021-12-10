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
exports.ChannelMembersService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const channel_members_entity_1 = require('./entity/channel_members.entity');
const users_entity_1 = require('../users/entity/users.entity');
const channels_entity_1 = require('../channels/entity/channels.entity');
let ChannelMembersService = class ChannelMembersService {
  constructor(channelMembersRepository) {
    this.channelMembersRepository = channelMembersRepository;
  }
  async getUserChannels(user) {
    return await this.channelMembersRepository
      .find({
        where: { member: user },
        relations: ['channel', 'member'],
      })
      .then((res) => {
        if (res == undefined) {
          return undefined;
        }
        return res.sort((a, b) => a.channel.id - b.channel.id);
      });
  }
  async getChannelMember(channel, user) {
    return await this.channelMembersRepository.findOne({
      where: {
        channel: channel,
        member: user,
      },
      relations: ['channel', 'member'],
    });
  }
  async getChannelMemberById(cm_id) {
    return await this.channelMembersRepository.findOne({
      where: {
        id: cm_id,
      },
      relations: ['channel', 'member'],
    });
  }
  async createChannelMember(
    channel,
    user,
    is_owner = false,
    is_admin = false,
    notification = false,
  ) {
    return await this.channelMembersRepository
      .save({
        channel: channel,
        member: user,
        is_owner: is_owner,
        is_admin: is_admin,
        notification: notification,
      })
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
  }
  async deleteChannelMember(cm_id) {
    return this.channelMembersRepository
      .delete(cm_id)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
  }
  async toggleAdmin(cm_id) {
    return await this.getChannelMemberById(cm_id).then((res) => {
      if (res) {
        res.is_admin = !res.is_admin;
        res.mute = '';
        res.ban = '';
        return this.channelMembersRepository
          .save(res)
          .then((result) => {
            return result;
          })
          .catch(() => {
            throw new common_1.BadRequestException(
              'Channel Member did not comply database requirements',
            );
          });
      }
    });
  }
  async muteBanMember(action, cm_id, end_date) {
    return await this.getChannelMemberById(cm_id).then(async (res) => {
      switch (action) {
        case 'unmute':
          res.mute = null;
          break;
        case 'unban':
          res.ban = null;
          break;
        case 'muted':
          res.mute = end_date.toString();
          break;
        case 'banned':
          res.ban = end_date.toString();
          break;
      }
      return await this.channelMembersRepository
        .save(res)
        .then((result) => {
          return result;
        })
        .catch(() => {
          throw new common_1.BadRequestException(
            'Channel Member did not comply database requirements',
          );
        });
    });
  }
  checkMute(cm) {
    if (cm.mute && Number(cm.mute) - Date.now() <= 0) {
      cm.mute = null;
      this.channelMembersRepository.save(cm).catch(() => {
        throw new common_1.BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
    }
    if (!cm.mute) {
      return false;
    }
    return true;
  }
  checkBan(cm) {
    if (cm.ban && Number(cm.ban) - Date.now() <= 0) {
      cm.ban = null;
      this.channelMembersRepository.save(cm).catch(() => {
        throw new common_1.BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
    }
    if (!cm.ban) {
      return false;
    }
    return true;
  }
  async setNewMessage(status, cmId) {
    const cm = await this.getChannelMemberById(cmId);
    if (!cm.notification) {
      if (cm.new_message == false) {
        return cm;
      }
      status = false;
    }
    cm.new_message = status;
    return await this.channelMembersRepository
      .save(cm)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Channel member did not comply database requirements',
        );
      });
  }
  async toggleNotification(cmId) {
    const cm = await this.getChannelMemberById(cmId);
    if (cm == undefined) {
      throw new common_1.BadRequestException(
        'Channel Member did not comply database requirements',
      );
    }
    cm.notification = !cm.notification;
    cm.new_message = false;
    return await this.channelMembersRepository
      .save(cm)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
  }
};
ChannelMembersService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(
      0,
      (0, typeorm_1.InjectRepository)(channel_members_entity_1.ChannelMembers),
    ),
    __metadata('design:paramtypes', [typeorm_2.Repository]),
  ],
  ChannelMembersService,
);
exports.ChannelMembersService = ChannelMembersService;
//# sourceMappingURL=channel_members.service.js.map
