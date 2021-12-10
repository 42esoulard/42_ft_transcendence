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
exports.ChannelsModule = exports.ChannelsService = void 0;
const common_1 = require('@nestjs/common');
const channels_service_1 = require('./channels.service');
const channels_controller_1 = require('./channels.controller');
const typeorm_1 = require('@nestjs/typeorm');
const channels_entity_1 = require('./entity/channels.entity');
const users_module_1 = require('../users/users.module');
var channels_service_2 = require('./channels.service');
Object.defineProperty(exports, 'ChannelsService', {
  enumerable: true,
  get: function () {
    return channels_service_2.ChannelsService;
  },
});
const channel_members_module_1 = require('../channel_members/channel_members.module');
const relationships_module_1 = require('../relationships/relationships.module');
let ChannelsModule = class ChannelsModule {};
ChannelsModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([channels_entity_1.Channels]),
        users_module_1.UsersModule,
        channel_members_module_1.ChannelMembersModule,
        relationships_module_1.RelationshipsModule,
      ],
      providers: [channels_service_1.ChannelsService],
      controllers: [channels_controller_1.ChannelsController],
      exports: [channels_service_1.ChannelsService],
    }),
  ],
  ChannelsModule,
);
exports.ChannelsModule = ChannelsModule;
//# sourceMappingURL=channels.module.js.map
