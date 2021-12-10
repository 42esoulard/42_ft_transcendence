import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';
declare const RefreshStrategy_base: new (...args: any[]) => Strategy;
export declare class RefreshStrategy extends RefreshStrategy_base {
  private authService;
  constructor(authService: AuthService);
  validate(
    req: Request,
    payload: JwtPayload,
  ): Promise<import('../../users/interfaces/user.interface').User>;
}
export {};
