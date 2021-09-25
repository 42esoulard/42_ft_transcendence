import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { env } from 'process';
import { FortyTwoUser } from './interfaces/42user.interface';
import { AuthService } from './auth.service';
import { User } from 'src/users/interfaces/user.interface';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly authService: AuthService
    ) {
    super({
      clientID: process.env['42_CLIENT_ID'],
      clientSecret: process.env['42_CLIENT_SECRET'],
      callbackURL: process.env['42_CALLBACK_URL'],
      scope: 'public',
      profileFields: {
        'id': function (obj: any) { return String(obj.id); },
        'username': 'login',
        'displayName': 'displayname',
        'lastname': 'last_name',
        'firstname': 'first_name',
        'profileUrl': 'url',
        'emails.0.value': 'email',
        'photo': 'image_url'
      }
    });
  }

  async validate(accessToken: string, refreshToken: string, profile, cb: Function): Promise<User> {
    const { username, provider, firstname, lastname, photo } = profile;
    console.log({ username, provider, firstname, lastname, photo });

    const userProfile: FortyTwoUser = { username, photo };
    const user = await this.authService.validateUser(userProfile);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  // function(accessToken, refreshToken, profile, cb) {
  //   return profile.id

  //   // User.findOrCreate({ fortytwoId: profile.id }, function (err, user) {
  //   //   return cb(err, user);
  //   // });
  // }

}