import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: (req: Request) => {
        if (!req || !req.cookies || !req.cookies.tokens) {
          return null;
        }
        return req.cookies.tokens.access_token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateJwtUser(payload.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!user.two_fa_enabled) {
      return user;
    }
    if (payload.isTwoFAauthenticated) {
      return user;
    }
  }
}
