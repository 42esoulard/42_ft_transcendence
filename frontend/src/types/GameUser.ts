import { Game } from "./Game";
import { User } from "./User";

export interface GameUser {
  won: boolean;
  userId: number;
  gameId: number;
  game: Game;
  user: User;
}
