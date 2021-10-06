import { Body, Controller, Post } from '@nestjs/common';
import { CreateGameDto } from './dto/createGame.dto';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
	constructor(private readonly pongService: PongService) { }
	
	@Post()
	createGame(@Body() game: CreateGameDto) {
		this.pongService.createGame(game)
	}
}
