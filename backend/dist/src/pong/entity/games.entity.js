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
exports.Game = void 0;
const openapi = require('@nestjs/swagger');
const users_entity_1 = require('../../users/entity/users.entity');
const typeorm_1 = require('typeorm');
const gameUser_entity_1 = require('./gameUser.entity');
let Game = class Game {
  static _OPENAPI_METADATA_FACTORY() {
    return {
      id: { required: true, type: () => Number },
      gameMode: { required: true, type: () => String },
      score1: { required: true, type: () => Number },
      score2: { required: true, type: () => Number },
      startedAt: { required: true, type: () => Date },
      users: {
        required: true,
        type: () => [require('./gameUser.entity').GameUser],
      },
    };
  }
};
__decorate(
  [(0, typeorm_1.PrimaryGeneratedColumn)(), __metadata('design:type', Number)],
  Game.prototype,
  'id',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({
      type: 'varchar',
      length: 50,
      nullable: true,
      default: 'classic',
    }),
    __metadata('design:type', String),
  ],
  Game.prototype,
  'gameMode',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata('design:type', Number),
  ],
  Game.prototype,
  'score1',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata('design:type', Number),
  ],
  Game.prototype,
  'score2',
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
  Game.prototype,
  'startedAt',
  void 0,
);
__decorate(
  [
    (0, typeorm_1.OneToMany)(
      () => gameUser_entity_1.GameUser,
      (gameuser) => gameuser.game,
      {
        onDelete: 'CASCADE',
        eager: true,
      },
    ),
    __metadata('design:type', Array),
  ],
  Game.prototype,
  'users',
  void 0,
);
Game = __decorate([(0, typeorm_1.Entity)('games')], Game);
exports.Game = Game;
//# sourceMappingURL=games.entity.js.map
