import { Users } from 'src/users/entity/users.entity';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
export declare class PongService {
  gameRepo: Repository<Game>;
  private userRepo;
  gameUserRepo: Repository<GameUser>;
  constructor(
    gameRepo: Repository<Game>,
    userRepo: Repository<Users>,
    gameUserRepo: Repository<GameUser>,
  );
  findAll(): Promise<Game[]>;
  findonGoing(): Promise<Game[]>;
  getGamebyId(gameId: number): Promise<Game>;
  getUserGameUser(id: number): Promise<GameUser[]>;
}
