import { Request, Response } from 'express';
import { TwoFactorDto } from './dto/TwoFactor.dto';
import { User } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
export declare class AuthController {
  private authService;
  private userService;
  constructor(authService: AuthService, userService: UsersService);
  login(
    req: Request,
    res: Response,
  ): Promise<
    | {
        message: string;
        newlyCreated?: undefined;
        username?: undefined;
      }
    | {
        message: string;
        newlyCreated: boolean;
        username?: undefined;
      }
    | {
        message: string;
        username: string;
        newlyCreated: boolean;
      }
  >;
  refreshToken(
    req: Request,
    res: Response,
  ): Promise<{
    message: string;
  }>;
  status(req: Request): User;
  profile(req: Request): Promise<User>;
  logout(
    req: Request,
    res: Response,
  ): {
    message: string;
  };
  findAll(session: Record<string, any>): void;
  register(response: Response, request: Request): Promise<any>;
  getKey(request: Request): {
    message: string;
    key: string;
  };
  turnOnTwoFactorAuthentication(
    request: Request,
    { code: twoFACode }: TwoFactorDto,
  ): Promise<{
    message: string;
  }>;
  turnOffTwoFactorAuthentication(request: Request): Promise<{
    message: string;
  }>;
  authenticate(
    request: Request,
    { code: twoFACode }: TwoFactorDto,
  ): Promise<User>;
}
