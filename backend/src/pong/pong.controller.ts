import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Game } from './entity/games.entity';
import { PongService } from './pong.service';

@Controller('pong')
export class PongController {
	constructor(private readonly pongService: PongService) { }
	
	@Get()
	getAll(): Promise<Game[]> {
		return this.pongService.findAll()
	}

	@Get('onGoingGames')
	GetOnGoingGames(): Promise<Game[]> {
		return this.pongService.findonGoing()
	}	

// 	@Get('id')
// 	test() {
// 		return this.pongService.getUserbyId(2)
// 	}
}
