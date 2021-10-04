import { Body, Controller, Get, Post, Redirect, Req, Res, Session, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from 'src/users/interfaces/user.interface';
import { AuthService } from './auth.service';
import { AuthenticatedGuard, FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) { }

  // @Get('login')
  // @UseGuards(FortyTwoAuthGuard)
  // async login() {
  //   console.log('LOGIN');
  //   return;
  // }

  // @Get('login')
  // async login(@Res() res: Response) {
  //   const url = process.env['42_AUTH_URL'];
  //   res.redirect(307, url);
  //   return;
  // }

  @Get('login')
  @UseGuards(FortyTwoAuthGuard)
  async login(@Req() req: Request) {
    const jwt = await this.authService.login(req.user as User);
    console.log(jwt);
    return jwt;
  }

  @Get('redirect')
  @UseGuards(FortyTwoAuthGuard)
  async redirect(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const jwt = await this.authService.login(req.user as User);
    console.log(jwt);

    // res.cookie("jwt", jwt.access_token, {
    //   httpOnly: true,
    // });
    res.header('Authorization', `Bearer ${jwt.access_token}`)
    // res.redirect(307, "http://localhost:8080/account");
    // res.sendStatus(200);
    return jwt;
  }

  @Get('refreshtoken')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const jwt = await this.authService.login(req.user as User);
    console.log(jwt);

    return jwt;
  }

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  status(@Req() req: Request) {
    return req.user;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Req() req: Request) {
    return req.user;
  }

  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    req.logOut();
    return "Logged out";
  }

  @Get()
  findAll(@Session() session: Record<string, any>) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }
}
