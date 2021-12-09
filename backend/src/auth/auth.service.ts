import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { FortyTwoUser } from './interfaces/42user.interface';
import { AuthProvider } from './interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { v4 as uuid } from 'uuid';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { Response } from 'express';

@Injectable()
export class AuthService implements AuthProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(userProfile: FortyTwoUser): Promise<User> {
    const user: User = await this.usersService.getUserByLogin(
      userProfile.username,
    );
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

  async validateJwtUser(login: string): Promise<User> {
    const user: User = await this.usersService.getUserByLogin(login);
    return user;
  }

  async generateAccessToken(user: User, isTwoFAauthenticated = false) {
    const payload: JwtPayload = {
      username: user.forty_two_login, //!\ username in cookie == forty_two_login
      sub: user.id,
      isTwoFAauthenticated,
    };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(id: number) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    const refresh_token = {
      id: id,
      refresh_token: uuid(),
      expiry_date: oneYearFromNow,
    };
    this.usersService.updateUserToken(refresh_token);
    return refresh_token.refresh_token;
  }

  async validRefreshToken(
    login: string,
    refresh_token: string,
  ): Promise<User> | null {
    const user: User = await this.usersService.getUserByLogin(login);
    if (user) {
      if (user.refresh_token === refresh_token) {
        if (user.expiry_date > new Date(Date.now())) {
          return user;
        }
      }
    }
    return null;
  }

  //The following functions are for 2FA

  public async generateTwoFASecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.username,
      process.env.APP_NAME,
      secret,
    );

    await this.usersService.saveTwoFASecret(secret, user.id);

    return { secret, otpauthUrl };
  }

  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  public isTwoFACodeValid(twoFactorAuthenticationCode: string, user: User) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.two_fa_secret,
    });
  }
}
