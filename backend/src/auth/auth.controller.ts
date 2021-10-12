import { Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Redirect, Req, Res, Session, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { TwoFactorDto } from './dto/TwoFactor.dto';
import { User } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthenticatedGuard, FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { JwtTwoFactorGuard } from './guards/jwtTwoFactor.guard';
import { RefreshTokenAuthGuard } from './guards/refresh.guard';
import { ApiCookieAuth, ApiOAuth2, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) { }

  @ApiOAuth2(['users'])
  @Get('42/login')
  @UseGuards(FortyTwoAuthGuard)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const jwt = await this.authService.generateAccessToken(req.user);
    const refresh_token = await this.authService.generateRefreshToken(req.user.id);

    res.cookie('tokens', { access_token: jwt.access_token, refresh_token }, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: true
    });
    return { message: "Logged in successfully" };
  }

  @Post('fake-login')
  async fakeLogin(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() { username }: { username: string }
  ) {
    console.log(username);
    const user: User = await this.userService.getUserByUsername(username);
    console.log('user', user);
    if (user == undefined) {
      throw new NotFoundException('User not found');
    }
    const jwt = await this.authService.generateAccessToken(user);
    const refresh_token = await this.authService.generateRefreshToken(user.id);

    res.cookie('tokens', { access_token: jwt.access_token, refresh_token }, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: true
    });
    return { message: "Logged in successfully" };
  }

  @ApiCookieAuth()
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

  @ApiCookieAuth()
  @Get('status')
  @UseGuards(AuthenticatedGuard)
  status(@Req() req: Request) {
    return req.user;
  }

  @ApiCookieAuth()
  @Get('profile')
  @UseGuards(JwtTwoFactorGuard)
  async profile(@Req() req: Request) {
    return req.user;
  }

  @ApiCookieAuth()
  @Get('logout')
  @UseGuards(JwtTwoFactorGuard)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    req.logOut();
    res.clearCookie('tokens');
    return { message: "Successfully logged out" };
  }

  @Get()
  findAll(@Session() session: Record<string, any>) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }

  @ApiCookieAuth()
  @Get('2fa/generate')
  @UseGuards(JwtTwoFactorGuard)
  async register(@Res() response: Response, @Req() request: Request) {

    // for debug w/o frontend
    // const user: User = await this.userService.getUserbyId(1);
    /////////////////////////////////////
    const { otpauthUrl } = await this.authService.generateTwoFASecret(request.user); // must be request.user
    return this.authService.pipeQrCodeStream(response, otpauthUrl);
  }

  @ApiCookieAuth()
  @Post('2fa/turn-on')
  @UseGuards(JwtTwoFactorGuard)
  async turnOnTwoFactorAuthentication(
    @Req() request: Request,
    @Body() { code: twoFACode }: TwoFactorDto
  ) {
    console.log('twoFACode', twoFACode);
    // for debug w/o frontend
    // const user: User = await this.userService.getUserbyId(1);
    /////////////////////////////////////

    console.log('USER:', request.user);

    const isCodeValid = this.authService.isTwoFACodeValid(
      twoFACode,
      request.user // must be request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFA(request.user.id); // must be request.user.id (1 is for dev)
    return { message: "2FA Successfully turned-on" };
  }

  @ApiCookieAuth()
  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtTwoFactorGuard)
  async authenticate(
    @Req() request: Request,
    @Body() { code: twoFACode }: TwoFactorDto
  ) {

    // for debug w/o frontend
    // const user: User = await this.userService.getUserbyId(1);
    /////////////////////////////////////

    const isCodeValid = this.authService.isTwoFACodeValid(
      twoFACode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const access_token = this.authService.getCookieWithJwtAccessToken(request.user, true);
    const refresh_token = await this.userService.getRefreshToken(request.user.id);

    request.res.cookie('tokens', { access_token: access_token, refresh_token }, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: true
    });
    return request.user;
  }
}
