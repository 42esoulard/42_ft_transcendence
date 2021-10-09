import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { FortyTwoUser } from './interfaces/42user.interface';
import { AuthProvider } from './interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwtPayload.interface';
import { v4 as uuid } from 'uuid';

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

  async generateAccessToken(user: User) {
    const payload: JwtPayload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async generateRefreshToken(id: number) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    const refresh_token = {
      id: id,
      refresh_token: uuid(),
      expiry_date: oneYearFromNow
    };
    this.usersService.updateUserToken(refresh_token)
    return refresh_token.refresh_token;
  }

  async validRefreshToken(username: string, refresh_token: string): Promise<User> | null {
    // console.log('validate:', {username, refresh_token} )
    const user: User = await this.usersService.getUserByUsername(username);
    // console.log(user);
    // console.log('RT:', refresh_token);
    if (user.refresh_token === refresh_token) {
      // console.log('exp:', user.expiry_date);
      // console.log('date:', new Date(Date.now()));
      if (user.expiry_date > new Date(Date.now())) {
        return user;
      }
    }
    return null;
  }
}
