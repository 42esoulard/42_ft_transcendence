import { Controller, Get, Redirect, Req, Res, Session, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedGuard, FortyTwoAuthGuard } from './fortytwo.guard';

@Controller('auth')
export class AuthController {

  @Get('login')
  @UseGuards(FortyTwoAuthGuard)
  async login() {
    return;
  }
  
  @Get('redirect')
  @UseGuards(FortyTwoAuthGuard)
  redirect(@Res() res: Response) {
    res.send(200);
  }
  
  @Get('status')
  @UseGuards(AuthenticatedGuard)
  status(@Req() req: any) {
    return req.user;
  }

  @Get('logout')
  logout(@Req() req: any) {
    console.log(req.query);
    return req.query;
  }

  @Get()
  findAll(@Session() session: Record<string, any>) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }

}
