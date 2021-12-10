import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { PongService } from './pong.service';
import { UsersService } from '../users/users.service';
export declare class PongController {
  private readonly pongService;
  private readonly userService;
  constructor(pongService: PongService, userService: UsersService);
  getAll(): Promise<Game[]>;
  GetOnGoingGames(): Promise<Game[]>;
  getUserGameUser(id: number): Promise<GameUser[]>;
  getGamebyId(id: number): Promise<Game>;
}
