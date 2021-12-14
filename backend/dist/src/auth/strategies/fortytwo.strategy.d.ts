import { Profile } from 'passport-42';
import { AuthService } from '../auth.service';
import { User } from '../../users/interfaces/user.interface';
declare const FortyTwoStrategy_base: new (...args: any[]) => any;
export declare class FortyTwoStrategy extends FortyTwoStrategy_base {
  private readonly authService;
  constructor(authService: AuthService);
  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: Function,
  ): Promise<User>;
}
export {};
