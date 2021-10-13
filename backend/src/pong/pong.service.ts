import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entity/users.entity';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';

@Injectable()
export class PongService {
	constructor(
		@InjectRepository(Game) 
		private readonly gameRepo:Repository<Game>,
    @InjectRepository(Users)
    private userRepo: Repository<Users>,
		) {}
	
	findAll(): Promise<Game[]> {
		return this.gameRepo.find()
	}

  async getUserbyId(id: number)
  {
    return this.userRepo.findOne(id, {
      relations: ['games', 'gameStats']
    })
  }



}
