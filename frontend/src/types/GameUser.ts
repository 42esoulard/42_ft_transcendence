import { Game } from "sdk/typescript-axios-client-generated";
import { User } from "./User";

export interface GameUser {
  won: boolean;
  userId: number;
  gameId: number;
  user: User;
}
