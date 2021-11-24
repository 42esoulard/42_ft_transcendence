import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error, user: User) => void): void {
    done(null, user);
  }

  async deserializeUser(user: User, done: (err: Error, user: User) => void) {
    const userFromDb: User = await this.usersService.getUserByLogin(
      user.forty_two_login,
    );
    if (userFromDb) {
      return done(null, userFromDb);
    } else {
      return done(null, null);
    }
  }
}
