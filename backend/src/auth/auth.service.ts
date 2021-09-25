import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { FortyTwoUser } from './interfaces/42user.interface';
import { AuthProvider } from './interfaces/auth.interface';


@Injectable()
export class AuthService implements AuthProvider {
  constructor(
    private readonly usersService: UsersService
  ) { }

  async validateUser(userProfile: FortyTwoUser): Promise<User> {
    const user: User = await this.usersService.getUserByUsername(userProfile.username);
    if (user) {
      return user;
    } else {
      const { username, photo } = userProfile;
      return this.usersService.saveUser({ username: username, password: 'password', avatar: photo });
    }
  }

  //The following is not used because of usersService
  createUser(userProfile: FortyTwoUser): Promise<User> {
    const { username, photo } = userProfile;
    return this.usersService.saveUser({ username: username, password: 'password', avatar: photo });
  }
  findUserById() {
    throw new Error('Method not implemented.');
  }





}
