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
exports.GameUser = void 0;
const openapi = require('@nestjs/swagger');
const users_entity_1 = require('../../users/entity/users.entity');
const typeorm_1 = require('typeorm');
const games_entity_1 = require('./games.entity');
let GameUser = class GameUser {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      won: { required: true, type: () => Boolean },
      userId: { required: true, type: () => Number },
      user: {
        required: true,
        type: () => require('../../users/entity/users.entity').Users,
      },
      gameId: { required: true, type: () => Number },
      game: { required: true, type: () => require('./games.entity').Game },
    };
  }
};
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'boolean', nullable: true }),
    __metadata('design:type', Boolean),
  ],
  GameUser.prototype,
  'won',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.PrimaryColumn)({ type: 'number' }),
    __metadata('design:type', Number),
  ],
  GameUser.prototype,
  'userId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => users_entity_1.Users,
      (user) => user.games,
      {
        onDelete: 'CASCADE',
        eager: true,
      },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata('design:type', users_entity_1.Users),
  ],
  GameUser.prototype,
  'user',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.PrimaryColumn)({ type: 'number' }),
    __metadata('design:type', Number),
  ],
  GameUser.prototype,
  'gameId',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.ManyToOne)(
      () => games_entity_1.Game,
      (game) => game,
      {
        onDelete: 'CASCADE',
      },
    ),
    (0, typeorm_1.JoinColumn)({ name: 'gameId' }),
    __metadata('design:type', games_entity_1.Game),
  ],
  GameUser.prototype,
  'game',
  void 0,
);
GameUser = __decorate([(0, typeorm_1.Entity)('gameUser')], GameUser);
exports.GameUser = GameUser;
//# sourceMappingURL=gameUser.entity.js.map
