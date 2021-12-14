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
exports.PongService = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const users_entity_1 = require('../users/entity/users.entity');
const typeorm_2 = require('typeorm');
const games_entity_1 = require('./entity/games.entity');
const gameUser_entity_1 = require('./entity/gameUser.entity');
let PongService = class PongService {
  constructor(gameRepo, userRepo, gameUserRepo) {
    this.gameRepo = gameRepo;
    this.userRepo = userRepo;
    this.gameUserRepo = gameUserRepo;
  }
  findAll() {
    return this.gameRepo.find();
  }
  async findonGoing() {
    const games = await this.gameRepo.find({
      relations: ['users', 'users.user'],
    });
    const ongoingGames = games.filter(
      (elem) => elem.users[0] && elem.users[0].won == null,
    );
    return ongoingGames;
  }
  async getGamebyId(gameId) {
    const res = await this.gameRepo.findOne(gameId, {
      relations: ['users'],
    });
    return res;
  }
  async getUserGameUser(id) {
    return await this.gameUserRepo.find({
      where: [{ userId: id }],
      relations: ['game'],
    });
  }
};
PongService = __decorate(
  [
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(games_entity_1.Game)),
    __param(1, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __param(2, (0, typeorm_1.InjectRepository)(gameUser_entity_1.GameUser)),
    __metadata('design:paramtypes', [
      typeorm_2.Repository,
      typeorm_2.Repository,
      typeorm_2.Repository,
    ]),
  ],
  PongService,
);
exports.PongService = PongService;
//# sourceMappingURL=pong.service.js.map
