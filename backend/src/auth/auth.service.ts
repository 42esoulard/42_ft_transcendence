import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { FortyTwoUser } from './interfaces/42user.interface';
import { AuthProvider } from './interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwtPayload.interface';

@Injectable()
export class AuthService implements AuthProvider {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) { }

  async validateUser(userProfile: FortyTwoUser): Promise<User> {
    const user: User = await this.usersService.getUserByUsername(userProfile.username);
    if (user) {
      return user;
    } else {
      const { username, photo } = userProfile;
      return this.usersService.saveUser({ username: username, forty_two_login: username, avatar: photo });
    }
  }

  async validateJwtUser(username: string): Promise<User> {
    const user: User = await this.usersService.getUserByUsername(username);
    return user;
  }

  async login(user: User) {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
