import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  UseGuards,
  BadRequestException,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { PongService } from './pong.service';
import { UsersService } from '../users/users.service';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Pong')
@Controller('pong')
export class PongController {
  constructor(
    private readonly pongService: PongService,
    private readonly userService: UsersService,
  ) {}

  @Get()
  getAll(): Promise<Game[]> {
    return this.pongService.findAll();
  }

  @Get('onGoingGames')
  GetOnGoingGames(): Promise<Game[]> {
    return this.pongService.findonGoing();
  }

  @Get('/user-games/:id')
  async getUserGameUser(@Param('id') id: number): Promise<GameUser[]> {
    const currentUser = await this.userService.getUserbyId(id);
    if (!currentUser) throw new BadRequestException("user doesn't exist");
    return await this.pongService.getUserGameUser(id);
  }

  /**
   * Returns a game found in database by its id.
   */
  @Get('/games/:id')
  @ApiOkResponse({
    description: 'The game has been found in database',
    type: Game,
  })
  @ApiNotFoundResponse({
    description: 'Game not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid ID supplied',
  })
  async getGamebyId(@Param('id') id: number): Promise<Game> {
    const game: Game = await this.pongService.getGamebyId(id);
    if (game == undefined) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }
}
