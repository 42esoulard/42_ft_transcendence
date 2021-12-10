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
exports.MessagesService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const typeorm_2 = require('typeorm');
const messages_entity_1 = require('./entity/messages.entity');
const channels_service_1 = require('../channels/channels.service');
const channel_members_service_1 = require('../channel_members/channel_members.service');
const users_service_1 = require('../users/users.service');
let MessagesService = class MessagesService {
  constructor(
    messagesRepository,
    channelService,
    channelMemberService,
    userService,
  ) {
    this.messagesRepository = messagesRepository;
    this.channelService = channelService;
    this.channelMemberService = channelMemberService;
    this.userService = userService;
  }
  async getMessages() {
    return await this.messagesRepository.find();
  }
  async saveMessage(messageDto) {
    const newMessage = this.messagesRepository.create(messageDto);
    newMessage.author = await this.userService.getUserbyId(
      messageDto.author_id,
    );
    newMessage.channel = await this.channelService.getChannelById(
      messageDto.channel_id,
      messageDto.author_id,
    );
    if (newMessage.channel == undefined || newMessage.author == undefined) {
      return undefined;
    }
    await this.channelMemberService
      .getChannelMember(newMessage.channel, newMessage.author)
      .then(async (res) => {
        if (newMessage.author.role == 'user' && res == undefined) {
          throw new common_1.ForbiddenException('not a member');
        }
        if (
          newMessage.author.role == 'user' &&
          this.channelMemberService.checkMute(res)
        ) {
          throw new common_1.ForbiddenException('muted');
        }
        if (
          newMessage.author.role == 'user' &&
          this.channelMemberService.checkBan(res)
        ) {
          throw new common_1.ForbiddenException('banned');
        }
        if (newMessage.channel.messages.length > 50) {
          await this.messagesRepository
            .delete(newMessage.channel.messages[0].id)
            .catch(() => {
              throw new common_1.BadRequestException(
                'Failed to purge messages from db',
              );
            });
        }
      });
    return await this.messagesRepository
      .save(newMessage)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new common_1.BadRequestException(
          'Message did not comply database requirements',
        );
      });
  }
};
MessagesService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(messages_entity_1.Messages)),
    __metadata('design:paramtypes', [
      typeorm_2.Repository,
      channels_service_1.ChannelsService,
      channel_members_service_1.ChannelMembersService,
      users_service_1.UsersService,
    ]),
  ],
  MessagesService,
);
exports.MessagesService = MessagesService;
//# sourceMappingURL=messages.service.js.map
