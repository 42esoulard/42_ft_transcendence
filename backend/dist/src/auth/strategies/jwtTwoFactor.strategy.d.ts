import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const JwtTwoFactorStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtTwoFactorStrategy extends JwtTwoFactorStrategy_base {
  private authService;
  constructor(authService: AuthService);
  validate(
    payload: JwtPayload,
  ): Promise<import('../../users/interfaces/user.interface').User>;
}
export {};
