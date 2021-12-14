import { BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsResponse,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { pongGame } from './classes/pong.pongGame';
import { player } from './classes/pong.player';
import {
  challengeExport,
  challengeMessage,
  gameMode,
  joinGameMessage,
} from './classes/pong.types';
import { challenge } from './classes/pong.challenge';
import { Users } from 'src/users/entity/users.entity';

@WebSocketGateway({ namespace: '/pong' })
export class PongGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(GameUser)
    private readonly gameUserRepo: Repository<GameUser>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PongGateway');

  private games = new Map<string, pongGame>(); // pongGame map. key = room id
  private waitingPlayerClassic: player = null;
  private waitingPlayerTranscendence: player = null;

  private pendingChallenges = new Map<string, challenge>(); // key = challenger name

  afterInit(server: Server): void {
    // this.logger.log('Initialized');
  }

  handleDisconnect(client: Socket): void {
    this.logger.log('Client disconected ' + client.id);
    this.clearQueue(client);
    this.leaveGameIfPlaying(client);
    this.removeSpectatorIfWatching(client);
    this.cancelChallengeIfChallenging(client);
  }

  leaveGameIfPlaying(client: Socket) {
    this.games.forEach((game: pongGame) => {
      if (
        game.player1.clientSocket.id === client.id ||
        game.player2.clientSocket.id === client.id
      )
        this.leaveGame(client, game.room);
    });
  }

  removeSpectatorIfWatching(client: Socket) {
    this.games.forEach((game: pongGame) => {
      if (game.spectators.includes(client))
        this.stopWatching(client, game.room);
    });
  }

  cancelChallengeIfChallenging(client: Socket) {
    this.pendingChallenges.forEach((pendingChallenge: challenge) => {
      if (pendingChallenge.challengerSocket.id === client.id)
        this.cancelChallenge(pendingChallenge.challengerName);
    });
  }

  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.log('Client connected ' + client.id);
    this.sendPlayingUsers(client);
    this.sendPendingChallenges(client);
  }

  sendPlayingUsers(client: Socket) {
    var playingUsers: string[] = []; // userNames
    this.games.forEach((game: pongGame) => {
      playingUsers.push(game.player1.userName, game.player2.userName);
    });
    if (playingUsers.length) client.emit('allPlayingUsers', playingUsers);
  }

  sendPendingChallenges(client: Socket) {
    // send only challengeeId and challengerId for each pending challenge

    var pendingChallengesArray: challengeExport[] = [];
    this.pendingChallenges.forEach((challenge: challenge) => {
      pendingChallengesArray.push({
        challengerName: challenge.challengerName,
        challengeeName: challenge.challengeeName,
        expiry_date: challenge.expiry_date,
      });
    });
    client.emit('allPendingChallenges', pendingChallengesArray);
  }

  @SubscribeMessage('challengeRequest')
  async handleAskToPlay(client: Socket, message: challengeMessage) {
    const newChallenge = new challenge(
      message.challengerId,
      message.challengerName,
      message.challengeeId,
      message.challengeeName,
      message.expiry_date,
      message.gameMode,
    );
    newChallenge.challengerSocket = client;
    this.pendingChallenges.set(message.challengerName, newChallenge);
    this.server.emit('challengeRequest', message);
    // setTimeout(() => {
    // this.pendingChallenges.delete(message.challengerId)
    // this.server.emit('challengeCancelled', message.challengerId)
    // }, 5000)
  }

  @SubscribeMessage('cancelChallenge')
  async handleCancelChallenge(client: Socket, challengerName: string) {
    this.cancelChallenge(challengerName);
  }

  @SubscribeMessage('challengeAccepted')
  async handleAcceptChallenge(client: Socket, challengerName: string) {
    const challenge = this.pendingChallenges.get(challengerName);
    if (!challenge) {
      this.logger.log('challenge does not exist');
      return;
    }
    const player1 = new player(
      challenge.challengeeId,
      challenge.challengeeName,
      client,
      1,
    );
    const player2 = new player(
      challenge.challengerId,
      challenge.challengerName,
      challenge.challengerSocket,
      2,
    );
    this.createGame(client, player1, player2, challenge.gameMode).catch();
  }

  @SubscribeMessage('challengeDeclined')
  async handleDeclineChallenge(client: Socket, challengerName: string) {
    const challenge = this.pendingChallenges.get(challengerName);
    if (!challenge) {
      this.logger.log('challenge does not exist');
      return;
    }
    challenge.challengerSocket.emit('challengeDeclined');
    this.pendingChallenges.delete(challengerName);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGameMessage(
    client: Socket,
    message: joinGameMessage,
  ): Promise<void> {
    if (this.userIsAlreadyInQueue(client, message.userId)) return;

    if (message.gameMode === 'classic') {
      if (!this.waitingPlayerClassic) this.addPlayerToQueue(client, message);
      else {
        const player2 = new player(message.userId, message.userName, client, 2);
        this.createGame(
          client,
          this.waitingPlayerClassic,
          player2,
          message.gameMode,
        ).catch();
      }
    }
    if (message.gameMode === 'transcendence') {
      if (!this.waitingPlayerTranscendence)
        this.addPlayerToQueue(client, message);
      else {
        const player2 = new player(message.userId, message.userName, client, 2);
        this.createGame(
          client,
          this.waitingPlayerTranscendence,
          player2,
          message.gameMode,
        ).catch();
      }
    }
  }

  addPlayerToQueue(client: Socket, message: joinGameMessage) {
    if (message.gameMode === 'classic')
      this.waitingPlayerClassic = new player(
        message.userId,
        message.userName,
        client,
        1,
      );
    if (message.gameMode === 'transcendence')
      this.waitingPlayerTranscendence = new player(
        message.userId,
        message.userName,
        client,
        1,
      );

    client.emit('addedToQueue');
  }

  @SubscribeMessage('watchGame')
  async handleWatchGame(client: Socket, gameId: string) {
    const game: pongGame = this.games.get(gameId);
    if (!game) {
      this.logger.log('game does not exist');
      return;
    }
    game.addSpectator(client);
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(client: Socket): void {
    this.clearQueue(client);
  }

  @SubscribeMessage('leaveGame')
  handleLeaveGame(client: Socket, room: string): void {
    this.leaveGame(client, room);
  }

  @SubscribeMessage('stopWatching')
  handleStopWatching(client: Socket, room: string): void {
    this.stopWatching(client, room);
  }

  @SubscribeMessage('enlargeRacquet')
  handleEnlargeRacquet(client: Socket, room: string) {
    const game: pongGame = this.games.get(room);
    if (!game) {
      this.logger.log('game does not exist');
      return;
    }
    game.enlargeRacquet(client);
  }

  @SubscribeMessage('moveRacquet')
  handleMoveRacquet(
    client: Socket,
    message: { room: string; text: string },
  ): void {
    const game: pongGame = this.games.get(message.room);
    if (!game) {
      this.logger.log('game does not exist');
      return;
    }
    game.moveRacquet(client, message.text);
  }

  userIsAlreadyInQueue(client: Socket, userId: number): boolean {
    if (
      (this.waitingPlayerClassic &&
        userId === this.waitingPlayerClassic.userId) ||
      (this.waitingPlayerTranscendence &&
        userId === this.waitingPlayerTranscendence.userId)
    ) {
      client.emit('alreadyInQueue');
      return true;
    }
    return false;
  }

  async createGame(
    client: Socket,
    player1: player,
    player2: player,
    gameMode: gameMode,
  ) {
    let enemy: Socket;
    if (gameMode == 'classic' && this.waitingPlayerClassic) {
      enemy = this.waitingPlayerClassic.clientSocket;
    } else if (gameMode == 'transcendence' && this.waitingPlayerTranscendence) {
      enemy = this.waitingPlayerTranscendence.clientSocket;
    }
    const usr1 = await this.userRepo.findOne(player1.userId);
    if (!usr1) {
      if (enemy) this.handleDisconnect(enemy);
      return;
    }
    const usr2 = await this.userRepo.findOne(player2.userId);
    if (!usr2) {
      if (enemy) this.handleDisconnect(enemy);
      return;
    }

    const game = new pongGame(
      player1,
      player2,
      this.gameRepo,
      this.gameUserRepo,
      this.userRepo,
      this.server,
      gameMode,
    );
    await game
      .createGame()
      .then(() => {
        this.games.set(game.room, game);
        this.server.emit('newInGameUsers', [
          player1.userName,
          player2.userName,
        ]);
      })
      .catch();
  }

  async leaveGame(clientWhoLeft: Socket, room: string) {
    const game: pongGame = this.games.get(room);
    if (!game) return;
    if (game.isOver === true) {
      this.games.delete(room);
      return;
    }
    const player1Won: boolean = clientWhoLeft === game.player2.clientSocket;
    await game.endGame(player1Won);
    this.games.delete(room);
    // this.server.emit("removeInGameUsers", [game.player1.userName, game.player2.userName]);
  }

  async stopWatching(client: Socket, room: string) {
    const game: pongGame = this.games.get(room);
    if (!game) return;
    game.removeSpectator(client);
  }

  clearQueue(client: Socket) {
    if (
      this.waitingPlayerClassic &&
      this.waitingPlayerClassic.clientSocket == client
    ) {
      delete this.waitingPlayerClassic;
      this.waitingPlayerClassic = null;
    }
    if (
      this.waitingPlayerTranscendence &&
      this.waitingPlayerTranscendence.clientSocket == client
    ) {
      delete this.waitingPlayerTranscendence;
      this.waitingPlayerTranscendence = null;
    }
  }

  cancelChallenge(challengerName: string) {
    this.pendingChallenges.delete(challengerName);
    this.server.emit('challengeCancelled', challengerName);
  }
}
