import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { FortyTwoUser } from '../interfaces/42user.interface';
import { AuthService } from '../auth.service';
import { User } from '../../users/interfaces/user.interface';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(
  Strategy,
  'FortyTwoStrategy',
) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env['42_CLIENT_ID'],
      clientSecret: process.env['42_CLIENT_SECRET'],
      callbackURL: process.env['42_CALLBACK_URL'],
      scope: 'public',
      profileFields: {
        id: function (obj: any) {
          return String(obj.id);
        },
        username: 'login',
        displayName: 'displayname',
        lastname: 'last_name',
        firstname: 'first_name',
        profileUrl: 'url',
        'emails.0.value': 'email',
        photo: 'image_url',
      },
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: Function,
  ): Promise<User> {
    const { username, provider, firstname, lastname, photo } = profile;
    const userProfile: FortyTwoUser = { username };
    const user = await this.authService.validateUser(userProfile);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
