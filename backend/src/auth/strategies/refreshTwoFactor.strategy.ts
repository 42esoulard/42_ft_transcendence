import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class RefreshTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'refresh-two-factor',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies || !req.cookies.tokens) {
          return null;
        }
        return req.cookies.tokens.access_token;
      },
      passReqToCallback: true,
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!payload) {
      throw new BadRequestException('invalid jwt token');
    }
    const cookie = req?.cookies['tokens'];
    if (!cookie?.refresh_token) {
      throw new BadRequestException('invalid refresh token');
    }
    const user = await this.authService.validRefreshToken(
      payload.username,
      cookie.refresh_token,
    );
    if (!user) {
      throw new BadRequestException('token expired');
    }
    if (!user.two_fa_enabled) {
      return user;
    }
    if (payload.isTwoFAauthenticated) {
      return user;
    }
  }
}
