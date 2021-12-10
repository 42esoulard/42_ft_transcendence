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
exports.UsersModule = exports.UsersService = void 0;
const common_1 = require('@nestjs/common');
const users_service_1 = require('./users.service');
var users_service_2 = require('./users.service');
Object.defineProperty(exports, 'UsersService', {
  enumerable: true,
  get: function () {
    return users_service_2.UsersService;
  },
});
const users_controller_1 = require('./users.controller');
const typeorm_1 = require('@nestjs/typeorm');
const users_entity_1 = require('./entity/users.entity');
const platform_express_1 = require('@nestjs/platform-express');
let UsersModule = class UsersModule {};
UsersModule = __decorate(
  [
    (0, common_1.Module)({
      imports: [
        typeorm_1.TypeOrmModule.forFeature([users_entity_1.Users]),
        platform_express_1.MulterModule.register({
          dest: './uploads',
        }),
      ],
      providers: [users_service_1.UsersService],
      controllers: [users_controller_1.UsersController],
      exports: [users_service_1.UsersService],
    }),
  ],
  UsersModule,
);
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map
