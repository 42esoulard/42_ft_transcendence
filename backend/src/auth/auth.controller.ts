import { Body, Controller, Get, HttpCode, Post, Redirect, Req, Res, Session, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserTwoFACode } from '../users/dto/UserTwoFACode.dto';
import { User } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthenticatedGuard, FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RefreshTokenAuthGuard } from './guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) { }

  @Get('login')
  @UseGuards(FortyTwoAuthGuard)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const jwt = await this.authService.generateAccessToken(req.user);
    const refresh_token = await this.authService.generateRefreshToken(req.user.id);
    // console.log(jwt);
    // console.log(refresh_token);

    res.cookie('tokens', { access_token: jwt.access_token, refresh_token }, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: true
    });
    return { message: "Logged in successfully" };
  }

  @Get('refreshtoken')
  @UseGuards(RefreshTokenAuthGuard)
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const jwt = await this.authService.generateAccessToken(req.user);
    const refresh_token = await this.userService.getRefreshToken(req.user.id);
    res.cookie('tokens', { access_token: jwt.access_token, refresh_token }, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: true
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

  @Post('2fa/generate')
  // @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @Req() request: Request) {
    const user: User = { // for debug w/o frontend
      id: 1,
      username: 'Mickey',
      forty_two_login: '',
      avatar: '',
      two_fa_secret: '',
      two_fa_enabled: false,
      refresh_token: '',
      expiry_date: undefined
    }
    const { otpauthUrl } = await this.authService.generateTwoFASecret(user); // must be request.user
    return this.authService.pipeQrCodeStream(response, otpauthUrl);
  }
  
  @Post('2fa/turn-on')
  // @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: Request,
    @Body() { twoFACode }: UserTwoFACode
    ) {
      
      const user: User = { // for debug w/o frontend
        id: 1,
        username: 'Mickey',
        forty_two_login: '',
        avatar: '',
        two_fa_secret: '',
        two_fa_enabled: false,
        refresh_token: '',
        expiry_date: undefined
      }
      const isCodeValid = this.authService.isTwoFACodeValid(
        twoFACode,
        user // must be request.user
        );
        if (!isCodeValid) {
          throw new UnauthorizedException('Wrong authentication code');
        }
        await this.userService.turnOnTwoFA(1); // must be request.user.id (1 is for dev)
      }
      
      @Post('2fa/authenticate')
      @HttpCode(200)
      // @UseGuards(JwtAuthGuard)
      async authenticate(
        @Req() request: Request,
        @Body() { twoFACode }: UserTwoFACode
        ) {
    const isCodeValid = this.authService.isTwoFACodeValid(
      twoFACode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const accessTokenCookie = this.authService.getCookieWithJwtAccessToken(request.user.id, true);

    request.res.setHeader('Set-Cookie', [accessTokenCookie]);

    return request.user;
  }
}
