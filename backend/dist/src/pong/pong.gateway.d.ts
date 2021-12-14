import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { player } from './classes/pong.player';
import {
  challengeMessage,
  gameMode,
  joinGameMessage,
} from './classes/pong.types';
import { Users } from 'src/users/entity/users.entity';
export declare class PongGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly gameRepo;
  private readonly gameUserRepo;
  private readonly userRepo;
  constructor(
    gameRepo: Repository<Game>,
    gameUserRepo: Repository<GameUser>,
    userRepo: Repository<Users>,
  );
  server: Server;
  private logger;
  private games;
  private waitingPlayerClassic;
  private waitingPlayerTranscendence;
  private pendingChallenges;
  afterInit(server: Server): void;
  handleDisconnect(client: Socket): void;
  leaveGameIfPlaying(client: Socket): void;
  removeSpectatorIfWatching(client: Socket): void;
  cancelChallengeIfChallenging(client: Socket): void;
  handleConnection(client: Socket, ...args: any[]): void;
  sendPlayingUsers(client: Socket): void;
  sendPendingChallenges(client: Socket): void;
  handleAskToPlay(client: Socket, message: challengeMessage): Promise<void>;
  handleCancelChallenge(client: Socket, challengerName: string): Promise<void>;
  handleAcceptChallenge(client: Socket, challengerName: string): Promise<void>;
  handleDeclineChallenge(client: Socket, challengerName: string): Promise<void>;
  handleJoinGameMessage(
    client: Socket,
    message: joinGameMessage,
  ): Promise<void>;
  addPlayerToQueue(client: Socket, message: joinGameMessage): void;
  handleWatchGame(client: Socket, gameId: string): Promise<void>;
  handleLeaveQueue(client: Socket): void;
  handleLeaveGame(client: Socket, room: string): void;
  handleStopWatching(client: Socket, room: string): void;
  handleEnlargeRacquet(client: Socket, room: string): void;
  handleMoveRacquet(
    client: Socket,
    message: {
      room: string;
      text: string;
    },
  ): void;
  userIsAlreadyInQueue(client: Socket, userId: number): boolean;
  createGame(
    client: Socket,
    player1: player,
    player2: player,
    gameMode: gameMode,
  ): Promise<void>;
  leaveGame(clientWhoLeft: Socket, room: string): Promise<void>;
  stopWatching(client: Socket, room: string): Promise<void>;
  clearQueue(client: Socket): void;
  cancelChallenge(challengerName: string): void;
}
