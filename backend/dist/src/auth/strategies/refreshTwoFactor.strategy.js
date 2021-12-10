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
exports.RefreshTwoFactorStrategy = void 0;
const common_1 = require('@nestjs/common');
const passport_1 = require('@nestjs/passport');
const passport_jwt_1 = require('passport-jwt');
const auth_service_1 = require('../auth.service');
let RefreshTwoFactorStrategy = class RefreshTwoFactorStrategy extends (0,
passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'refresh-two-factor') {
  constructor(authService) {
    super({
      jwtFromRequest: (req) => {
        if (!req || !req.cookies || !req.cookies.tokens) {
          return null;
        }
        return req.cookies.tokens.access_token;
      },
      passReqToCallback: true,
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
    this.authService = authService;
  }
  async validate(req, payload) {
    if (!payload) {
      throw new common_1.BadRequestException('invalid jwt token');
    }
    const cookie =
      req === null || req === void 0 ? void 0 : req.cookies['tokens'];
    if (
      !(cookie === null || cookie === void 0 ? void 0 : cookie.refresh_token)
    ) {
      throw new common_1.BadRequestException('invalid refresh token');
    }
    const user = await this.authService.validRefreshToken(
      payload.username,
      cookie.refresh_token,
    );
    if (!user) {
      throw new common_1.BadRequestException('token expired');
    }
    if (!user.two_fa_enabled) {
      return user;
    }
    if (payload.isTwoFAauthenticated) {
      return user;
    }
  }
};
RefreshTwoFactorStrategy = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [auth_service_1.AuthService]),
  ],
  RefreshTwoFactorStrategy,
);
exports.RefreshTwoFactorStrategy = RefreshTwoFactorStrategy;
//# sourceMappingURL=refreshTwoFactor.strategy.js.map
