import { Controller, Get, Redirect, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { FortyTwoAuthGuard } from './fortytwo.guard';

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
  status() {
  }

  @Get('logout')
  logout(@Req() req: any) {
    console.log(req.query);
    return req.query;
  }
}
