import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Redirect,
  Req,
  Res,
  Session,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TwoFactorDto } from './dto/TwoFactor.dto';
import { User } from '../users/interfaces/user.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthenticatedGuard, FortyTwoAuthGuard } from './guards/fortytwo.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtTwoFactorGuard } from './guards/jwtTwoFactor.guard';
import { RefreshTwoFactorGuard } from './guards/refreshTwoFactor.guard';
import { ApiCookieAuth, ApiOAuth2, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @ApiOAuth2(['users'])
  @Get('42/login')
  @UseGuards(FortyTwoAuthGuard)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const userAlreadyExists = await this.userService.getRefreshToken(
      req.user.id,
    );

    const access_token = await this.authService.generateAccessToken(req.user);
    const refresh_token = await this.authService.generateRefreshToken(
      req.user.id,
    );

    res.cookie(
      'tokens',
      { access_token: access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );

    if (req.user.two_fa_enabled) {
      res.status(206);
      return { message: 'Need 2FA to log in' };
    }
    // Should return a message mentionning if newly created user
    if (userAlreadyExists) {
      return {
        message: 'Logged in successfully',
        newlyCreated: false,
      };
    } else {
      return {
        message: 'Logged in successfully',
        username: req.user.username,
        newlyCreated: true,
      };
    }
  }

  @ApiCookieAuth()
  @Get('refreshtoken')
  @UseGuards(RefreshTwoFactorGuard)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    let access_token: string;
    if (req.user.two_fa_enabled) {
      access_token = await this.authService.generateAccessToken(req.user, true);
    } else {
      access_token = await this.authService.generateAccessToken(req.user);
    }
    const refresh_token = await this.userService.getRefreshToken(req.user.id);
    res.cookie(
      'tokens',
      { access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );
    return { message: 'Token refreshed successfully' };
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
    return { message: 'Successfully logged out' };
  }

  @Get()
  findAll(@Session() session: Record<string, any>) {
    session.visits = session.visits ? session.visits + 1 : 1;
  }

  @ApiCookieAuth()
  @Get('2fa/generate')
  @UseGuards(JwtTwoFactorGuard)
  async register(@Res() response: Response, @Req() request: Request) {
    const { otpauthUrl } = await this.authService.generateTwoFASecret(
      request.user,
    );
    return this.authService.pipeQrCodeStream(response, otpauthUrl);
  }

  @ApiCookieAuth()
  @Get('2fa/key')
  @UseGuards(JwtTwoFactorGuard)
  getKey(@Req() request: Request) {
    let key = 'No available key';
    if (request.user.two_fa_secret) {
      key = request.user.two_fa_secret;
    }
    return { message: 'Two-factor key', key: key };
  }

  @ApiCookieAuth()
  @Post('2fa/turn-on')
  @UseGuards(JwtTwoFactorGuard)
  // @UseFilters(HttpExceptionFilter)
  async turnOnTwoFactorAuthentication(
    @Req() request: Request,
    @Body() { code: twoFACode }: TwoFactorDto,
  ) {
    const isCodeValid = this.authService.isTwoFACodeValid(
      twoFACode,
      request.user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFA(request.user.id);
    const access_token = await this.authService.generateAccessToken(
      request.user,
      true,
    );
    const refresh_token = await this.userService.getRefreshToken(
      request.user.id,
    );

    request.res.cookie(
      'tokens',
      { access_token: access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );

    return { message: '2FA Successfully turned-on' };
  }

  @ApiCookieAuth()
  @Get('2fa/turn-off')
  @UseGuards(JwtTwoFactorGuard)
  async turnOffTwoFactorAuthentication(@Req() request: Request) {
    await this.userService.turnOffTwoFA(request.user.id);
    return { message: '2FA Successfully turned-off' };
  }

  @ApiCookieAuth()
  @Post('2fa/authenticate')
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req() request: Request,
    @Body() { code: twoFACode }: TwoFactorDto,
  ) {
    const isCodeValid = this.authService.isTwoFACodeValid(
      twoFACode,
      request.user,
    );
    if (!isCodeValid) {
      throw new UnauthorizedException({
        error: 'wrong_code',
        message: 'Wrong authentication code',
      });
    }

    const access_token = await this.authService.generateAccessToken(
      request.user,
      true,
    );
    const refresh_token = await this.userService.getRefreshToken(
      request.user.id,
    );

    request.res.cookie(
      'tokens',
      { access_token: access_token, refresh_token },
      {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: true,
      },
    );
    return request.user;
  }
}
