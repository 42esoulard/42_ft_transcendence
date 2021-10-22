import { GameUser } from "./GameUser"

export interface Game {
  id: number;
  gameMode	: string;
  score1: number;
  score2: number;
  startedAt: Date;
  users: GameUser[];
}
