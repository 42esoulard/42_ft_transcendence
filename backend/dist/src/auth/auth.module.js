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
exports.AuthModule = void 0;
const common_1 = require('@nestjs/common');
const users_module_1 = require('../users/users.module');
const auth_controller_1 = require('./auth.controller');
const auth_service_1 = require('./auth.service');
const fortytwo_strategy_1 = require('./strategies/fortytwo.strategy');
const Serializer_1 = require('./utils/Serializer');
const jwt_1 = require('@nestjs/jwt');
const jwt_strategy_1 = require('./strategies/jwt.strategy');
const passport_1 = require('@nestjs/passport');
const jwtTwoFactor_strategy_1 = require('./strategies/jwtTwoFactor.strategy');
const refreshTwoFactor_strategy_1 = require('./strategies/refreshTwoFactor.strategy');
const roles_guard_1 = require('./guards/roles.guard');
let AuthModule = class AuthModule {};
AuthModule = __decorate(
  [
    (0, common_1.Module)({
      controllers: [auth_controller_1.AuthController],
      providers: [
        auth_service_1.AuthService,
        fortytwo_strategy_1.FortyTwoStrategy,
        jwt_strategy_1.JwtStrategy,
        jwtTwoFactor_strategy_1.JwtTwoFactorStrategy,
        refreshTwoFactor_strategy_1.RefreshTwoFactorStrategy,
        Serializer_1.SessionSerializer,
        roles_guard_1.RolesGuard,
      ],
      imports: [
        users_module_1.UsersModule,
        passport_1.PassportModule,
        jwt_1.JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1d' },
        }),
      ],
    }),
  ],
  AuthModule,
);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map
