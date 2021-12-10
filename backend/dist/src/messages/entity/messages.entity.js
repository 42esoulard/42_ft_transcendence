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
exports.Messages = void 0;
const openapi = require('@nestjs/swagger');
const channels_entity_1 = require('../../channels/entity/channels.entity');
const users_entity_1 = require('../../users/entity/users.entity');
const typeorm_1 = require('typeorm');
let Messages = class Messages {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      channel: {
        required: true,
        type: () => require('../../channels/entity/channels.entity').Channels,
      },
      author: {
        required: true,
        type: () => require('../../users/entity/users.entity').Users,
      },
      content: { required: true, type: () => String },
      created_at: { required: true, type: () => Date },
    };
  }
};
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)(), __metadata('design:type', Number)],
  Messages.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => channels_entity_1.Channels,
      (channel) => channel.messages,
      {
        onDelete: 'CASCADE',
      },
    ),
    __metadata('design:type', channels_entity_1.Channels),
  ],
  Messages.prototype,
  'channel',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => users_entity_1.Users,
      (author) => author.messages,
      {
        onDelete: 'CASCADE',
        eager: true,
      },
    ),
    __metadata('design:type', users_entity_1.Users),
  ],
  Messages.prototype,
  'author',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 100000 }),
    __metadata('design:type', String),
  ],
  Messages.prototype,
  'content',
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
  Messages.prototype,
  'created_at',
  void 0,
);
Messages = __decorate([(0, typeorm_1.Entity)('messages')], Messages);
exports.Messages = Messages;
//# sourceMappingURL=messages.entity.js.map
