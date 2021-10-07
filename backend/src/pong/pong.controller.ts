import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateGameDto } from './dto/createGame.dto';
import { EndGameDto } from './dto/endGame.dto';
import { Game } from './entity/games.entity';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
	constructor(private readonly pongService: PongService) { }
	
	@Get()
	getAll(): Promise<Game[]> {
		return this.pongService.findAll()
	}

	@Post()
	createGame(@Body() game: CreateGameDto): Promise<Game> {
		return this.pongService.createGame(game)
	}

	@Patch(':id')
	endGame(@Param('id') id: string, @Body() score: EndGameDto): Promise<Game> {
		return this.pongService.endGame(Number(id), score)
	}

	@Get('seed')
	seed() {
		this.pongService.seed()
	}

	@Get('id')
	test() {
		return this.pongService.getUserbyId(2)
	}
}
