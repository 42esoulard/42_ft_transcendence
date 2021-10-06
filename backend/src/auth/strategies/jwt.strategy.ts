import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
    // a modifier
    const user = await this.authService.validateJwtUser(payload.username);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
    // console.log('sub: ', payload.sub, payload.username);
    // return { userId: payload.sub, username: payload.username };
  }
}
