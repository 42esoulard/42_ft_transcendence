import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTwoFactorGuard extends AuthGuard('refresh-two-factor') {}
