import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entity/users.entity';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
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
		) {}

	findAll(): Promise<Game[]> {
		return this.gameRepo.find()
	}

  async findonGoing(): Promise<Game[]> {
    const games = await this.gameRepo.find({relations: ['users', 'users.user']})
    const ongoingGames = games.filter(elem => elem.users[0].won == null) // 'won' attribute is set when game ends
    return ongoingGames
  }

  // async getUserbyId(id: number)
  // {
  //   return this.userRepo.findOne(id, {
  //     relations: ['games', 'gameStats']
  //   })
  // }



  async getGamebyId(gameId: number): Promise<Game> {
    const res = await this.gameRepo.findOne(gameId, {
      relations: ['users'],
    });
    return res;
  }
}
