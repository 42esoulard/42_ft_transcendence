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
exports.AuthController = void 0;
const openapi = require('@nestjs/swagger');
const common_1 = require('@nestjs/common');
const TwoFactor_dto_1 = require('./dto/TwoFactor.dto');
const users_service_1 = require('../users/users.service');
const auth_service_1 = require('./auth.service');
const fortytwo_guard_1 = require('./guards/fortytwo.guard');
const jwt_guard_1 = require('./guards/jwt.guard');
const jwtTwoFactor_guard_1 = require('./guards/jwtTwoFactor.guard');
const refreshTwoFactor_guard_1 = require('./guards/refreshTwoFactor.guard');
const swagger_1 = require('@nestjs/swagger');
let AuthController = class AuthController {
  constructor(authService, userService) {
    this.authService = authService;
    this.userService = userService;
  }
  async login(req, res) {
    const userAlreadyExists = await this.userService.getRefreshToken(
      req.user.id,
    );
    const access_token = await this.authService.generateAccessToken(req.user);
    const refresh_token = await this.authService.generateRefreshToken(
      req.user.id,
    );
    res.cookie(
      'tokens',
      { access_token: access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );
    if (req.user.two_fa_enabled) {
      res.status(206);
      return { message: 'Need 2FA to log in' };
    }
    if (userAlreadyExists) {
      return {
        message: 'Logged in successfully',
        newlyCreated: false,
      };
    } else {
      return {
        message: 'Logged in successfully',
        username: req.user.username,
        newlyCreated: true,
      };
    }
  }
  async refreshToken(req, res) {
    let access_token;
    if (req.user.two_fa_enabled) {
      access_token = await this.authService.generateAccessToken(req.user, true);
    } else {
      access_token = await this.authService.generateAccessToken(req.user);
    }
    const refresh_token = await this.userService.getRefreshToken(req.user.id);
    res.cookie(
      'tokens',
      { access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );
    return { message: 'Token refreshed successfully' };
  }
  status(req) {
    return req.user;
  }
  async profile(req) {
    return req.user;
  }
  logout(req, res) {
    req.logOut();
    res.clearCookie('tokens');
    return { message: 'Successfully logged out' };
  }
  findAll(session) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }
  async register(response, request) {
    const { otpauthUrl } = await this.authService.generateTwoFASecret(
      request.user,
    );
    return this.authService.pipeQrCodeStream(response, otpauthUrl);
  }
  getKey(request) {
    let key = 'No available key';
    if (request.user.two_fa_secret) {
      key = request.user.two_fa_secret;
    }
    return { message: 'Two-factor key', key: key };
  }
  async turnOnTwoFactorAuthentication(request, { code: twoFACode }) {
    const isCodeValid = this.authService.isTwoFACodeValid(
      twoFACode,
      request.user,
    );
    if (!isCodeValid) {
      throw new common_1.UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFA(request.user.id);
    const access_token = await this.authService.generateAccessToken(
      request.user,
      true,
    );
    const refresh_token = await this.userService.getRefreshToken(
      request.user.id,
    );
    request.res.cookie(
      'tokens',
      { access_token: access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );
    return { message: '2FA Successfully turned-on' };
  }
  async turnOffTwoFactorAuthentication(request) {
    await this.userService.turnOffTwoFA(request.user.id);
    return { message: '2FA Successfully turned-off' };
  }
  async authenticate(request, { code: twoFACode }) {
    const isCodeValid = this.authService.isTwoFACodeValid(
      twoFACode,
      request.user,
    );
    if (!isCodeValid) {
      throw new common_1.UnauthorizedException({
        error: 'wrong_code',
        message: 'Wrong authentication code',
      });
    }
    const access_token = await this.authService.generateAccessToken(
      request.user,
      true,
    );
    const refresh_token = await this.userService.getRefreshToken(
      request.user.id,
    );
    request.res.cookie(
      'tokens',
      { access_token: access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );
    return request.user;
  }
};
__decorate(
  [
    (0, swagger_1.ApiOAuth2)(['users']),
    (0, common_1.Get)('42/login'),
    (0, common_1.UseGuards)(fortytwo_guard_1.FortyTwoAuthGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'login',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('refreshtoken'),
    (0, common_1.UseGuards)(refreshTwoFactor_guard_1.RefreshTwoFactorGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'refreshToken',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)(fortytwo_guard_1.AuthenticatedGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../users/interfaces/user.interface').User,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  AuthController.prototype,
  'status',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({
      status: 200,
      type: require('../users/interfaces/user.interface').User,
    }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'profile',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('logout'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', void 0),
  ],
  AuthController.prototype,
  'logout',
  null,
);
__decorate(
  [
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Session)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  AuthController.prototype,
  'findAll',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('2fa/generate'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, Object]),
    __metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'register',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('2fa/key'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', void 0),
  ],
  AuthController.prototype,
  'getKey',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Post)('2fa/turn-on'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 201 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, TwoFactor_dto_1.TwoFactorDto]),
    __metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'turnOnTwoFactorAuthentication',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Get)('2fa/turn-off'),
    (0, common_1.UseGuards)(jwtTwoFactor_guard_1.JwtTwoFactorGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object]),
    __metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'turnOffTwoFactorAuthentication',
  null,
);
__decorate(
  [
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.Post)('2fa/authenticate'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    openapi.ApiResponse({
      status: 201,
      type: require('../users/interfaces/user.interface').User,
    }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [Object, TwoFactor_dto_1.TwoFactorDto]),
    __metadata('design:returntype', Promise),
  ],
  AuthController.prototype,
  'authenticate',
  null,
);
AuthController = __decorate(
  [
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata('design:paramtypes', [
      auth_service_1.AuthService,
      users_service_1.UsersService,
    ]),
  ],
  AuthController,
);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
