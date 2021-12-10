import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('FortyTwoStrategy') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    let activate = false;

    try {
      activate = (await super.canActivate(context)) as boolean;
    } catch (err: any) {
      throw new BadRequestException('invalid code');
    }
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
  }
}

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    return req.isAuthenticated();
  }
}
