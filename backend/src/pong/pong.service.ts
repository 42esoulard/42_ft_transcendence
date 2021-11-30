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
    public gameRepo: Repository<Game>,
    @InjectRepository(Users)
    private userRepo: Repository<Users>,
    @InjectRepository(GameUser)
    public gameUserRepo: Repository<GameUser>,
  ) {}

  findAll(): Promise<Game[]> {
    return this.gameRepo.find();
  }

  async findonGoing(): Promise<Game[]> {
    const games = await this.gameRepo.find({
      relations: ['users', 'users.user'],
    });
    const ongoingGames = games.filter(
      (elem) => elem.users[0] && elem.users[0].won == null,
    ); // 'won' attribute is set when game ends
    return ongoingGames;
  }

  async getGamebyId(gameId: number): Promise<Game> {
    const res = await this.gameRepo.findOne(gameId, {
      relations: ['users'],
    });
    return res;
  }

  async getUserGameUser(id: number): Promise<GameUser[]> {
    return await this.gameUserRepo.find({
      where: [{ userId: id }],
      relations: ['game'],
    });
  }
}
