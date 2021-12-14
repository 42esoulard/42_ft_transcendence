import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from 'src/users/users.service';
export declare class SessionSerializer extends PassportSerializer {
  private readonly usersService;
  constructor(usersService: UsersService);
  serializeUser(user: User, done: (err: Error, user: User) => void): void;
  deserializeUser(
    user: User,
    done: (err: Error, user: User) => void,
  ): Promise<void>;
}
