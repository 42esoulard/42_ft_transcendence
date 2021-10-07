import { Body, Controller, Get, Post, Redirect, Req, Res, Session, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { User } from 'src/users/interfaces/user.interface';
import { AuthService } from './auth.service';
import { AuthenticatedGuard, FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshTokenAuthGuard } from './guards/refresh.guard';

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
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    
    const jwt = await this.authService.getAccessToken(req.user);
    const refresh_token = await this.authService.getRefreshToken(req.user.id);
    // console.log(jwt);
    // console.log(refresh_token);

    res.cookie('tokens', {access_token: jwt.access_token, refresh_token}, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
    });
    return { message: "Logged in successfully" };
  }

  @Get('refreshtoken')
  @UseGuards(RefreshTokenAuthGuard)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const jwt = await this.authService.getAccessToken(req.user);
    const refresh_token = await this.authService.getRefreshToken(req.user.id);
    res.cookie('tokens', { access_token: jwt.access_token, refresh_token }, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
    });
    return { message: "Refresh token successfully" };
  }

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  status(@Req() req: Request) {
    return req.user;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req: Request) {
    return req.user;
  }

  @Get('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    req.logOut();
    res.clearCookie('tokens');
    return { message: "Successfully logged out" };
  }

  @Get()
  findAll(@Session() session: Record<string, any>) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }
}
