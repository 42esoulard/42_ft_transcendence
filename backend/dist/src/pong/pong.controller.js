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
exports.PongController = void 0;
const openapi = require('@nestjs/swagger');
const common_1 = require('@nestjs/common');
const games_entity_1 = require('./entity/games.entity');
const pong_service_1 = require('./pong.service');
const users_service_1 = require('../users/users.service');
const swagger_1 = require('@nestjs/swagger');
let PongController = class PongController {
  constructor(pongService, userService) {
    this.pongService = pongService;
    this.userService = userService;
  }
  getAll() {
    return this.pongService.findAll();
  }
  GetOnGoingGames() {
    return this.pongService.findonGoing();
  }
  async getUserGameUser(id) {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser)
      throw new common_1.BadRequestException("user doesn't exist");
    return await this.pongService.getUserGameUser(id);
  }
  async getGamebyId(id) {
    const game = await this.pongService.getGamebyId(id);
    if (game == undefined) {
      throw new common_1.NotFoundException('Game not found');
    }
    return game;
  }
};
__decorate(
  [
    (0, common_1.Get)(),
    openapi.ApiResponse({
      status: 200,
      type: [require('./entity/games.entity').Game],
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  PongController.prototype,
  'getAll',
  null,
);
__decorate(
  [
    (0, common_1.Get)('onGoingGames'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./entity/games.entity').Game],
    }),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', []),
    __metadata('design:returntype', Promise),
  ],
  PongController.prototype,
  'GetOnGoingGames',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/user-games/:id'),
    openapi.ApiResponse({
      status: 200,
      type: [require('./entity/gameUser.entity').GameUser],
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  PongController.prototype,
  'getUserGameUser',
  null,
);
__decorate(
  [
    (0, common_1.Get)('/games/:id'),
    (0, swagger_1.ApiOkResponse)({
      description: 'The game has been found in database',
      type: games_entity_1.Game,
    }),
    (0, swagger_1.ApiNotFoundResponse)({
      description: 'Game not found',
    }),
    (0, swagger_1.ApiBadRequestResponse)({
      description: 'Invalid ID supplied',
    }),
    openapi.ApiResponse({
      status: 200,
      type: require('./entity/games.entity').Game,
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Number]),
    __metadata('design:returntype', Promise),
  ],
  PongController.prototype,
  'getGamebyId',
  null,
);
PongController = __decorate(
  [
    (0, swagger_1.ApiTags)('Pong'),
    (0, common_1.Controller)('pong'),
    __metadata('design:paramtypes', [
      pong_service_1.PongService,
      users_service_1.UsersService,
    ]),
  ],
  PongController,
);
exports.PongController = PongController;
//# sourceMappingURL=pong.controller.js.map
