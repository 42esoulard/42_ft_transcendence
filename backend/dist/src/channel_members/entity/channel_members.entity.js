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
Object.defineProperty(exports, '__esModule', { value: true });
exports.ChannelMembers = void 0;
const openapi = require('@nestjs/swagger');
const channels_entity_1 = require('../../channels/entity/channels.entity');
const users_entity_1 = require('../../users/entity/users.entity');
const typeorm_1 = require('typeorm');
let ChannelMembers = class ChannelMembers {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      channel: {
        required: true,
        type: () => require('../../channels/entity/channels.entity').Channels,
      },
      member: {
        required: true,
        type: () => require('../../users/entity/users.entity').Users,
      },
      is_owner: { required: true, type: () => Boolean },
      is_admin: { required: true, type: () => Boolean },
      notification: { required: true, type: () => Boolean },
      new_message: { required: true, type: () => Boolean },
      ban: { required: true, type: () => String },
      mute: { required: true, type: () => String },
      created_at: { required: true, type: () => Date },
    };
  }
};
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)(), __metadata('design:type', Number)],
  ChannelMembers.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => channels_entity_1.Channels,
      (channel) => channel.channel_members,
      {
        onDelete: 'CASCADE',
      },
    ),
    __metadata('design:type', channels_entity_1.Channels),
  ],
  ChannelMembers.prototype,
  'channel',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => users_entity_1.Users,
      (user) => user.channel_members,
      {
        eager: true,
        onDelete: 'CASCADE',
      },
    ),
    __metadata('design:type', users_entity_1.Users),
  ],
  ChannelMembers.prototype,
  'member',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  ChannelMembers.prototype,
  'is_owner',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  ChannelMembers.prototype,
  'is_admin',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  ChannelMembers.prototype,
  'notification',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  ChannelMembers.prototype,
  'new_message',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ length: 15, nullable: true, default: null }),
    __metadata('design:type', String),
  ],
  ChannelMembers.prototype,
  'ban',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ length: 15, nullable: true, default: null }),
    __metadata('design:type', String),
  ],
  ChannelMembers.prototype,
  'mute',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.CreateDateColumn)({
      type: 'timestamp',
      default: () => 'now()',
    }),
    __metadata('design:type', Date),
  ],
  ChannelMembers.prototype,
  'created_at',
  void 0,
);
ChannelMembers = __decorate(
  [(0, typeorm_1.Entity)('channel_members')],
  ChannelMembers,
);
exports.ChannelMembers = ChannelMembers;
//# sourceMappingURL=channel_members.entity.js.map
