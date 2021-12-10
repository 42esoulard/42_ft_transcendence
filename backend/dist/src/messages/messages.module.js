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
Object.defineProperty(exports, '__esModule', { value: true });
exports.MessagesModule = void 0;
const common_1 = require('@nestjs/common');
const messages_service_1 = require('./messages.service');
const messages_controller_1 = require('./messages.controller');
const typeorm_1 = require('@nestjs/typeorm');
const messages_entity_1 = require('./entity/messages.entity');
const channels_module_1 = require('../channels/channels.module');
const users_module_1 = require('../users/users.module');
const channel_members_module_1 = require('../channel_members/channel_members.module');
let MessagesModule = class MessagesModule {};
MessagesModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([messages_entity_1.Messages]),
        channels_module_1.ChannelsModule,
        channel_members_module_1.ChannelMembersModule,
        users_module_1.UsersModule,
      ],
      providers: [messages_service_1.MessagesService],
      controllers: [messages_controller_1.MessagesController],
    }),
  ],
  MessagesModule,
);
exports.MessagesModule = MessagesModule;
//# sourceMappingURL=messages.module.js.map
