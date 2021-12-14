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
exports.PongModule = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const games_entity_1 = require('./entity/games.entity');
const pong_gateway_1 = require('./pong.gateway');
const pong_controller_1 = require('./pong.controller');
const pong_service_1 = require('./pong.service');
const users_entity_1 = require('../users/entity/users.entity');
const gameUser_entity_1 = require('./entity/gameUser.entity');
const users_module_1 = require('../users/users.module');
let PongModule = class PongModule {};
PongModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([
          games_entity_1.Game,
          users_entity_1.Users,
          gameUser_entity_1.GameUser,
        ]),
        users_module_1.UsersModule,
      ],
      providers: [pong_gateway_1.PongGateway, pong_service_1.PongService],
      controllers: [pong_controller_1.PongController],
      exports: [pong_service_1.PongService],
    }),
  ],
  PongModule,
);
exports.PongModule = PongModule;
//# sourceMappingURL=pong.module.js.map
