import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { pongGame } from './classes/pong.pongGame';
import { player } from './classes/pong.player';
import { challengeExport, challengeMessage, gameMode, joinGameMessage } from './classes/pong.types';
import { challenge } from './classes/pong.challenge';


@WebSocketGateway( { namespace: '/pong'})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(GameUser)
    private readonly gameUserRepo: Repository<GameUser>
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PongGateway');

  private games = new Map<string, pongGame>() // pongGame map. key = room id
  private waitingPlayerClassic: player = null
  private waitingPlayerTranscendence: player = null

  private pendingChallenges = new Map<string, challenge>() // key = challenger name


  afterInit(server: Server): void {
    this.logger.log('Initialized')
  }

  handleDisconnect(client: Socket): void {
    this.logger.log('Client disconected ' + client.id);
    this.clearQueue(client)
    this.leaveGameIfPlaying(client)
    this.cancelChallengeIfChallenging(client)
  }

  leaveGameIfPlaying(client: Socket)
  {
    this.games.forEach((game: pongGame) => {
      if (game.player1.clientSocket.id === client.id || game.player2.clientSocket.id === client.id)
        this.leaveGame(client, game.room)
    })
  }

  cancelChallengeIfChallenging(client: Socket)
  {
    this.pendingChallenges.forEach((pendingChallenge: challenge) => {
      if (pendingChallenge.challengerSocket.id === client.id)
        this.cancelChallenge(pendingChallenge.challengerName)
    })
  }

  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.log('Client connected ' + client.id);
    this.sendPlayingUsers(client)
    this.sendPendingChallenges(client)
  }

  sendPlayingUsers(client: Socket)
  {
    var playingUsers: string[] = [] // userNames
    this.games.forEach((game: pongGame) => {
      playingUsers.push(game.player1.userName, game.player2.userName)
    })
    this.logger.log(playingUsers)
    if (playingUsers.length)
      client.emit('allPlayingUsers', playingUsers)
  }

  sendPendingChallenges(client: Socket)
  {
    // send only challengeeId and challengerId for each pending challenge

    var pendingChallengesArray: challengeExport[] = []
    this.pendingChallenges.forEach((challenge: challenge) => {
      pendingChallengesArray.push({challengerName: challenge.challengerName, challengeeName: challenge.challengeeName})
    })
    client.emit('allPendingChallenges', pendingChallengesArray)
  }

  @SubscribeMessage('challengeRequest')
  async handleAskToPlay(client: Socket, message: challengeMessage)
  {
    const newChallenge = new challenge(message.challengerId, message.challengerName, message.challengeeId, message.challengeeName, message.expiry_date, message.gameMode)
    newChallenge.challengerSocket = client
    this.pendingChallenges.set(message.challengerName, newChallenge)
    this.server.emit('challengeRequest', message)
    // setTimeout(() => {
    // this.pendingChallenges.delete(message.challengerId)
    // this.server.emit('challengeCancelled', message.challengerId)
    // }, 5000)
  }

  @SubscribeMessage('cancelChallenge')
  async handleCancelChallenge(client: Socket, challengerName: string)
  {
    this.cancelChallenge(challengerName)
  }

  @SubscribeMessage('challengeAccepted')
  async handleAcceptChallenge(client: Socket, challengerName: string)
  {
    const challenge = this.pendingChallenges.get(challengerName)
    if (!challenge)
    {
      this.logger.error('challenge does not exist')
      return
    }
    // this.logger.log('challenge accepted ', message)
    const player1 = new player(challenge.challengeeId, challenge.challengeeName, client, 1)
    const player2 = new player(challenge.challengerId, challenge.challengerName, challenge.challengerSocket, 2)
    this.createGame(player1, player2, challenge.gameMode)
  }

  @SubscribeMessage('challengeDeclined')
  async handleDeclineChallenge(client: Socket, challengerName: string)
  {
    const challenge = this.pendingChallenges.get(challengerName)
    if (!challenge)
    {
      this.logger.error('challenge does not exist')
      return
    }
    challenge.challengerSocket.emit('challengeDeclined')
    this.pendingChallenges.delete(challengerName)
  }

  @SubscribeMessage('joinGame')
  async handleJoinGameMessage(client: Socket, message: joinGameMessage): Promise<void>
  {
    // this.logger.log('client joined game. userID: ' + message.userId + ' gameMode: ' + message.gameMode)

    if (this.userIsAlreadyInQueue(client, message.userId))
      return

    if (message.gameMode === 'classic')
    {
      if (!this.waitingPlayerClassic)
        this.addPlayerToQueue(client, message)
      else
      {
        const player2 = new player(message.userId, message.userName, client, 2)
        this.createGame(this.waitingPlayerClassic, player2, message.gameMode)
      }
    }
    if (message.gameMode === 'transcendence')
    {
      if (!this.waitingPlayerTranscendence)
        this.addPlayerToQueue(client, message)
      else
      {
        const player2 = new player(message.userId, message.userName, client, 2)
        this.createGame(this.waitingPlayerTranscendence, player2, message.gameMode)

      }
    }
  }

  addPlayerToQueue(client: Socket, message: joinGameMessage)
  {
    if (message.gameMode === 'classic')
      this.waitingPlayerClassic = new player(message.userId, message.userName, client, 1)
    if (message.gameMode === 'transcendence')
      this.waitingPlayerTranscendence = new player(message.userId, message.userName, client, 1)

    client.emit('addedToQueue')
  }

  @SubscribeMessage('watchGame')
  async handleWatchGame(client: Socket, gameId: string)
  {
    this.logger.log("watchGame received")
    const game: pongGame = this.games.get(gameId)
    if (!game)
    {
      this.logger.error('watchGame: game doesnt exist')
      return
    }
    game.addSpectator(client)
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(client: Socket): void
  {
    this.clearQueue(client)
  }


  @SubscribeMessage('leaveGame')
  handleLeaveGame(client: Socket, room:string): void
  {
    this.leaveGame(client, room)
  }

  @SubscribeMessage('enlargeRacquet')
  handleEnlargeRacquet(client: Socket, room: string)
  {
    const game: pongGame = this.games.get(room)
    if (!game)
    {
      this.logger.error('moveRacquet: game doesnt exist')
      return
    }
    game.enlargeRacquet(client)
  }

  @SubscribeMessage('moveRacquet')
  handleMoveRacquet(client: Socket, message: {room: string, text: string}): void {

    const game: pongGame = this.games.get(message.room)
    if (!game)
    {
      this.logger.error('moveRacquet: game doesnt exist')
      return
    }
    game.moveRacquet(client, message.text)
  }

  userIsAlreadyInQueue(client: Socket, userId: number): boolean
  {
    if ((this.waitingPlayerClassic && userId === this.waitingPlayerClassic.userId) ||
      (this.waitingPlayerTranscendence && userId === this.waitingPlayerTranscendence.userId))
    {
      client.emit('alreadyInQueue')
      return true
    }
    return false
  }

  async createGame(player1: player, player2: player, gameMode: gameMode)
  {
    const game = new pongGame(player1, player2, this.gameRepo, this.gameUserRepo, this.server, gameMode)
    await game.createGame()
    this.games.set(game.room, game)
    this.server.emit("newInGameUsers", [player1.userName, player2.userName]);
  }

  async leaveGame(clientWhoLeft: Socket, room: string)
  {
    const game: pongGame = this.games.get(room)
    if (!game)
      return
    if (game.isOver === true)
    {
      this.games.delete(room)
      return
    }
    const player1Won: boolean = clientWhoLeft === game.player2.clientSocket
    await game.endGame(player1Won)
    this.games.delete(room)
    // this.server.emit("removeInGameUsers", [game.player1.userName, game.player2.userName]);
  }

  clearQueue(client: Socket)
  {
    if (this.waitingPlayerClassic && this.waitingPlayerClassic.clientSocket == client)
    {
      delete this.waitingPlayerClassic
      this.waitingPlayerClassic = null
    }
    if (this.waitingPlayerTranscendence && this.waitingPlayerTranscendence.clientSocket == client)
    {
      delete this.waitingPlayerTranscendence
      this.waitingPlayerTranscendence = null
    }
  }

  cancelChallenge(challengerName: string)
  {
    this.pendingChallenges.delete(challengerName)
    this.server.emit('challengeCancelled', challengerName)
  }
}
