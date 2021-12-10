import { Users } from 'src/users/entity/users.entity';
import { Game } from './games.entity';
export declare class GameUser {
  won: boolean;
  userId: number;
  user: Users;
  gameId: number;
  game: Game;
}
