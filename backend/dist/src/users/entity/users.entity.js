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
exports.Users = void 0;
const openapi = require('@nestjs/swagger');
const games_entity_1 = require('../../pong/entity/games.entity');
const gameUser_entity_1 = require('../../pong/entity/gameUser.entity');
const messages_entity_1 = require('../../messages/entity/messages.entity');
const typeorm_1 = require('typeorm');
const relationships_entity_1 = require('../../relationships/entity/relationships.entity');
const channel_members_entity_1 = require('../../channel_members/entity/channel_members.entity');
const role_enum_1 = require('../../auth/models/role.enum');
let Users = class Users {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      role: {
        required: true,
        enum: require('../../auth/models/role.enum').Role,
      },
      username: { required: true, type: () => String },
      forty_two_login: { required: true, type: () => String },
      avatar: { required: true, type: () => String },
      two_fa_secret: { required: true, type: () => String },
      two_fa_enabled: { required: true, type: () => Boolean },
      banned: { required: true, type: () => Boolean },
      refresh_token: { required: true, type: () => String },
      expiry_date: { required: true, type: () => Date },
      created_at: { required: true, type: () => Date },
      games: {
        required: true,
        type: () => [require('../../pong/entity/gameUser.entity').GameUser],
      },
      messages: {
        required: true,
        type: () => [require('../../messages/entity/messages.entity').Messages],
      },
      channel_members: {
        required: true,
        type: () => [
          require('../../channel_members/entity/channel_members.entity')
            .ChannelMembers,
        ],
      },
      relationships_requested: {
        required: true,
        type: () => [
          require('../../relationships/entity/relationships.entity')
            .Relationships,
        ],
      },
      relationships_adressed: {
        required: true,
        type: () => [
          require('../../relationships/entity/relationships.entity')
            .Relationships,
        ],
      },
    };
  }
};
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)(), __metadata('design:type', Number)],
  Users.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({
      type: 'enum',
      enum: role_enum_1.Role,
      default: role_enum_1.Role.USER,
    }),
    __metadata('design:type', String),
  ],
  Users.prototype,
  'role',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 8, unique: true }),
    __metadata('design:type', String),
  ],
  Users.prototype,
  'username',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({
      type: 'varchar',
      length: 50,
      unique: true,
      nullable: true,
    }),
    __metadata('design:type', String),
  ],
  Users.prototype,
  'forty_two_login',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata('design:type', String),
  ],
  Users.prototype,
  'avatar',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 16, nullable: true }),
    __metadata('design:type', String),
  ],
  Users.prototype,
  'two_fa_secret',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  Users.prototype,
  'two_fa_enabled',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ default: false }),
    __metadata('design:type', Boolean),
  ],
  Users.prototype,
  'banned',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'varchar', length: 36, nullable: true }),
    __metadata('design:type', String),
  ],
  Users.prototype,
  'refresh_token',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'now()' }),
    __metadata('design:type', Date),
  ],
  Users.prototype,
  'expiry_date',
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
  Users.prototype,
  'created_at',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => gameUser_entity_1.GameUser,
      (gameuser) => gameuser.user,
      {
        cascade: true,
      },
    ),
    __metadata('design:type', Array),
  ],
  Users.prototype,
  'games',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => messages_entity_1.Messages,
      (message) => message.author,
    ),
    __metadata('design:type', Array),
  ],
  Users.prototype,
  'messages',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => channel_members_entity_1.ChannelMembers,
      (cm) => cm.member,
      {
        cascade: true,
      },
    ),
    __metadata('design:type', Array),
  ],
  Users.prototype,
  'channel_members',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => relationships_entity_1.Relationships,
      (relationship) => relationship.requester,
    ),
    __metadata('design:type', Array),
  ],
  Users.prototype,
  'relationships_requested',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => relationships_entity_1.Relationships,
      (relationship) => relationship.adressee,
    ),
    __metadata('design:type', Array),
  ],
  Users.prototype,
  'relationships_adressed',
  void 0,
);
Users = __decorate([(0, typeorm_1.Entity)('users')], Users);
exports.Users = Users;
//# sourceMappingURL=users.entity.js.map
