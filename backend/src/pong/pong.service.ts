import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entity/users.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from './dto/createGame.dto';
import { EndGameDto } from './dto/endGame.dto';
import { Game } from './entity/games.entity';
import { GameStats } from './entity/gameStats.entity';
import { GameUser } from './entity/gameUser.entity';

@Injectable()
export class PongService {
	constructor(
		@InjectRepository(Game) 
		private readonly gameRepo:Repository<Game>,
    @InjectRepository(Users)
    private userRepo: Repository<Users>,
    @InjectRepository(GameUser)
    private gameUserRepo: Repository<GameUser>,
    @InjectRepository(GameStats)
    private gameStats: Repository<GameStats>
		) {}
	
	findAll(): Promise<Game[]> {
		return this.gameRepo.find()
	}

	createGame(game: CreateGameDto): Promise<Game> {
		return this.gameRepo.save(game)
	}

	async endGame(id: number, score: EndGameDto): Promise<Game> {
		await this.gameRepo.update(id, score)
		return this.gameRepo.findOne(id)
	}
  
	async seed() {
    const basile = this.userRepo.create({ username: 'basile'})
    await this.userRepo.save(basile)

    const julien = this.userRepo.create({ username: 'JN'})
    await this.userRepo.save(julien)
    
    const basileStats = this.gameStats.create( { ladderLevel: 2})
    basileStats.user = basile
    await this.gameStats.save(basileStats)

    const game1 = this.gameRepo.create( {score1: 5, score2: 6})
    await this.gameRepo.save(game1)
    
    const basilegame1 = this.gameUserRepo.create( { won: true})
    basilegame1.userId = basile.id
    basilegame1.game = game1
    await this.gameUserRepo.save(basilegame1)

    const juliengame1 = this.gameUserRepo.create( { won: false})
    juliengame1.userId = julien.id
    juliengame1.game = game1
    await this.gameUserRepo.save(juliengame1)

  }

  async getUserbyId(id: number)
  {
    return this.userRepo.findOne(id, {
      relations: ['games', 'gameStats']
    })
  }



}
