import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/createGame.dto';
import { Game } from './entity/games.entity';

@Injectable()
export class PongService {
	constructor(@InjectRepository(Game) private readonly repo:Repository<Game>) {}
	
	findAll(): Promise<Game[]> {
		return this.repo.find()
	}

	createGame(game: CreateGameDto): Promise<Game> {
		return this.repo.save(game)

		// console.log('game created')
		// console.log(game)
	}
}
