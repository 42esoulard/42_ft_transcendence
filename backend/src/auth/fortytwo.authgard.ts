import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-42';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FortyTwoOauthGuard extends AuthGuard('42') { }