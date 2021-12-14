import { User } from 'src/users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { FortyTwoUser } from './interfaces/42user.interface';
import { AuthProvider } from './interfaces/auth.interface';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
export declare class AuthService implements AuthProvider {
  private readonly usersService;
  private readonly jwtService;
  constructor(usersService: UsersService, jwtService: JwtService);
  validateUser(userProfile: FortyTwoUser): Promise<User>;
  validateJwtUser(login: string): Promise<User>;
  generateAccessToken(
    user: User,
    isTwoFAauthenticated?: boolean,
  ): Promise<string>;
  generateRefreshToken(id: number): Promise<string>;
  validRefreshToken(login: string, refresh_token: string): Promise<User> | null;
  generateTwoFASecret(user: User): Promise<{
    secret: string;
    otpauthUrl: string;
  }>;
  pipeQrCodeStream(stream: Response, otpauthUrl: string): Promise<any>;
  isTwoFACodeValid(twoFactorAuthenticationCode: string, user: User): boolean;
}
