import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
  private authService;
  constructor(authService: AuthService);
  validate(
    payload: JwtPayload,
  ): Promise<import('../../users/interfaces/user.interface').User>;
}
export {};
