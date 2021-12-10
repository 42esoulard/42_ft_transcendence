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
exports.Channels = void 0;
const openapi = require('@nestjs/swagger');
const channel_members_entity_1 = require('../../channel_members/entity/channel_members.entity');
const messages_entity_1 = require('../../messages/entity/messages.entity');
const typeorm_1 = require('typeorm');
let Channels = class Channels {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      name: { required: true, type: () => String },
      type: { required: true, type: () => String },
      password: { required: true, type: () => String },
      channel_members: {
        required: true,
        type: () => [
          require('../../channel_members/entity/channel_members.entity')
            .ChannelMembers,
        ],
      },
      messages: {
        required: true,
        type: () => [require('../../messages/entity/messages.entity').Messages],
      },
      created_at: { required: true, type: () => Date },
    };
  }
};
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)(), __metadata('design:type', Number)],
  Channels.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata('design:type', String),
  ],
  Channels.prototype,
  'name',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata('design:type', String),
  ],
  Channels.prototype,
  'type',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata('design:type', String),
  ],
  Channels.prototype,
  'password',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => channel_members_entity_1.ChannelMembers,
      (cm) => cm.channel,
      {
        cascade: true,
        eager: true,
        nullable: true,
      },
    ),
    __metadata('design:type', Array),
  ],
  Channels.prototype,
  'channel_members',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => messages_entity_1.Messages,
      (message) => message.channel,
      {
        eager: true,
      },
    ),
    __metadata('design:type', Array),
  ],
  Channels.prototype,
  'messages',
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
  Channels.prototype,
  'created_at',
  void 0,
);
Channels = __decorate([(0, typeorm_1.Entity)('channels')], Channels);
exports.Channels = Channels;
//# sourceMappingURL=channels.entity.js.map
