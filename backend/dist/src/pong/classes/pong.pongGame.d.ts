import { coordinates, gameMode } from './pong.types';
import { player } from './pong.player';
import { Repository } from 'typeorm';
import { Game } from '../entity/games.entity';
import { GameUser } from '../entity/gameUser.entity';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { Users } from 'src/users/entity/users.entity';
export declare class pongGame {
  player1: player;
  player2: player;
  private readonly gameRepo;
  private readonly gameUserRepo;
  private readonly userRepo;
  server: Server;
  gameMode: gameMode;
  constructor(
    player1: player,
    player2: player,
    gameRepo: Repository<Game>,
    gameUserRepo: Repository<GameUser>,
    userRepo: Repository<Users>,
    server: Server,
    gameMode: gameMode,
  );
  private logger;
  isOver: boolean;
  room: string;
  gameId: number;
  ballPosition: coordinates;
  ballDirection: coordinates;
  ballSpeed: number;
  interval: any;
  timeout: any;
  spectators: Socket[];
  initPositions(): void;
  initBallDirection(): void;
  initRacquetLength(): void;
  pushGameintoDB(): Promise<void>;
  pushGameUsersintoDB(): Promise<void>;
  createGame(): Promise<void>;
  spectatorWarnNewGame(): Promise<void>;
  addSpectator(client: Socket): Promise<void>;
  removeSpectator(client: Socket): void;
  startFromCenter(): void;
  endGame(player1Won: boolean): Promise<void>;
  spectatorWarnEndGame(): Promise<void>;
  updateGame(): void;
  updateScore(): void;
  updateBallDirection(): void;
  accelerateBall(): void;
  ballCollisionWithPlayer1(): boolean;
  ballCollisionWithPlayer2(): boolean;
  updateBallPosition(): void;
  handleScore(player1Scored: boolean): void;
  restartFromCenter(): void;
  getPlayerPositions(): {
    player1: number;
    player2: number;
  };
  getPlayerScores(): {
    player1: number;
    player2: number;
  };
  moveRacquet(client: Socket, direction: string): void;
  enlargeRacquet(client: Socket): void;
}
