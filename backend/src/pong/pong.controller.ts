import { Controller, Get, Post, Put, Body, Param, NotFoundException, UseInterceptors, UploadedFile, Res, StreamableFile, UseGuards, BadRequestException, Req, HttpStatus } from '@nestjs/common';
import { Game } from './entity/games.entity';
import { PongService } from './pong.service';
import { ApiBadRequestResponse, ApiCookieAuth, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Pong')
@Controller('pong')
export class PongController {
	constructor(private readonly pongService: PongService) { }

	@Get()
	getAll(): Promise<Game[]> {
		return this.pongService.findAll()
	}

	@Get('id')
	test() {
		return this.pongService.getUserbyId(2)
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
		const game: Game = await this.pongService.getGamebyId(id)
		if (game == undefined) {
			throw new NotFoundException('Game not found');
		}
		return game;
	}
}
