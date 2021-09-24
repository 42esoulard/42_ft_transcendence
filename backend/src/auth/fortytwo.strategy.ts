import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { PassportStrategy } from '@nestjs/passport';
import { env } from 'process';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      // authorizationURL: process.env['42_AUTH_URL'],
      // tokenURL: process.env['42_TOKEN_URL'],
      clientID: process.env['42_CLIENT_ID'],
      clientSecret: process.env['42_CLIENT_SECRET'],
      callbackURL: process.env['42_CALLBACK_URL'],
      scope: 'public', 
      profileFields: {
        'id': function (obj: any) { return String(obj.id); },
        'username': 'login',
        // 'displayName': 'displayname',
        // 'name.familyName': 'last_name',
        // 'name.givenName': 'first_name',
        // 'profileUrl': 'url',
        // 'emails.0.value': 'email',
        // 'phoneNumbers.0.value': 'phone',
        // 'photos.0.value': 'image_url'
      }
    });
  }

  async validate(accessToken: string, refreshToken:string, profile, cb): Promise<any> {
    const { username } = profile;
    console.log(username);
  }

  // function(accessToken, refreshToken, profile, cb) {
  //   return profile.id

  //   // User.findOrCreate({ fortytwoId: profile.id }, function (err, user) {
  //   //   return cb(err, user);
  //   // });
  // }

}