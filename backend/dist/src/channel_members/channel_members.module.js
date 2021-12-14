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
exports.ChannelMembersModule = void 0;
const common_1 = require('@nestjs/common');
const channel_members_service_1 = require('./channel_members.service');
const typeorm_1 = require('@nestjs/typeorm');
const channel_members_entity_1 = require('./entity/channel_members.entity');
let ChannelMembersModule = class ChannelMembersModule {};
ChannelMembersModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          channel_members_entity_1.ChannelMembers,
        ]),
      ],
      providers: [channel_members_service_1.ChannelMembersService],
      exports: [channel_members_service_1.ChannelMembersService],
    }),
  ],
  ChannelMembersModule,
);
exports.ChannelMembersModule = ChannelMembersModule;
//# sourceMappingURL=channel_members.module.js.map
