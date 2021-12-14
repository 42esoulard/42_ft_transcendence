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
exports.AuthService = void 0;
const common_1 = require('@nestjs/common');
const user_interface_1 = require('../users/interfaces/user.interface');
const users_service_1 = require('../users/users.service');
const jwt_1 = require('@nestjs/jwt');
const uuid_1 = require('uuid');
const otplib_1 = require('otplib');
const qrcode_1 = require('qrcode');
let AuthService = class AuthService {
  constructor(usersService, jwtService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }
  async validateUser(userProfile) {
    const user = await this.usersService.getUserByLogin(userProfile.username);
    if (user) {
      return user;
    } else {
      let { username } = userProfile;
      const tmpUsername = username;
      if (await this.usersService.getUserByUsername(username))
        username =
          (username.length < 8
            ? username
            : username.substr(0, username.length - 1)) + '1';
      return this.usersService.saveUser({
        username: username,
        forty_two_login: tmpUsername,
        two_fa_enabled: false,
        avatar: `${process.env.BASE_URL}/users/avatars/default.jpg`,
      });
    }
  }
  async validateJwtUser(login) {
    const user = await this.usersService.getUserByLogin(login);
    return user;
  }
  async generateAccessToken(user, isTwoFAauthenticated = false) {
    const payload = {
      username: user.forty_two_login,
      sub: user.id,
      isTwoFAauthenticated,
    };
    return this.jwtService.sign(payload);
  }
  async generateRefreshToken(id) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    const refresh_token = {
      id: id,
      refresh_token: (0, uuid_1.v4)(),
      expiry_date: oneYearFromNow,
    };
    this.usersService.updateUserToken(refresh_token);
    return refresh_token.refresh_token;
  }
  async validRefreshToken(login, refresh_token) {
    const user = await this.usersService.getUserByLogin(login);
    if (user) {
      if (user.refresh_token === refresh_token) {
        if (user.expiry_date > new Date(Date.now())) {
          return user;
        }
      }
    }
    return null;
  }
  async generateTwoFASecret(user) {
    const secret = otplib_1.authenticator.generateSecret();
    const otpauthUrl = otplib_1.authenticator.keyuri(
      user.username,
      process.env.APP_NAME,
      secret,
    );
    await this.usersService.saveTwoFASecret(secret, user.id);
    return { secret, otpauthUrl };
  }
  async pipeQrCodeStream(stream, otpauthUrl) {
    return (0, qrcode_1.toFileStream)(stream, otpauthUrl);
  }
  isTwoFACodeValid(twoFactorAuthenticationCode, user) {
    return otplib_1.authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.two_fa_secret,
    });
  }
};
AuthService = __decorate(
  [
    (0, common_1.Injectable)(),
    __metadata('design:paramtypes', [
      users_service_1.UsersService,
      jwt_1.JwtService,
    ]),
  ],
  AuthService,
);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map
