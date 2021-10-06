import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateGameDto } from './dto/createGame.dto';
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
}
