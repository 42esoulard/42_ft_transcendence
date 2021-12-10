import { GameUser } from './gameUser.entity';
export declare class Game {
  id: number;
  gameMode: string;
  score1: number;
  score2: number;
  startedAt: Date;
  users: GameUser[];
}
