import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { pongGame } from './classes/pong.pongGame';
import { player } from './classes/pong.player';
import { gameMode, joinGameMessage } from './classes/pong.types';


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

  private games = new Map() // pongGame map. key = room id
  private waitingPlayerClassic: player = null
  private waitingPlayerTranscendence: player = null
  
  
  afterInit(server: Server): void {
    this.logger.log('Initialized')
  }
  
  handleDisconnect(client: Socket): void {
    this.logger.log('Client disconected ' + client.id);
    this.clearQueue(client)
    // if (this.waitingPlayer && this.waitingPlayer.clientSocket == client)
    // {
    //   delete this.waitingPlayer
    //   this.waitingPlayer = null
    // }
    this.games.forEach((value: pongGame, key: string) => {
      if (value.player1.clientSocket.id === client.id || value.player2.clientSocket.id === client.id)
        this.leaveGame(client, key)
    })
  }
  
  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.log('Client connected ' + client.id);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGameMessage(client: Socket, message: joinGameMessage): Promise<void>
  {
    this.logger.log('client joined game. userId: ' + message.userName + ' gameMode: ' + message.gameMode)
    if (message.gameMode == 'classic')
    {
      if (!this.waitingPlayerClassic)
      {
        this.waitingPlayerClassic = new player(message.userId, message.userName, client, 1)
        client.emit('waitingForOpponent')
      }
      else
        this.createGame(this.waitingPlayerClassic, message, client)
    }
    if (message.gameMode == 'transcendence')
    {
      if (!this.waitingPlayerTranscendence)
      {
        this.waitingPlayerTranscendence = new player(message.userId, message.userName, client, 1)
        client.emit('waitingForOpponent')
      }
      else
        this.createGame(this.waitingPlayerTranscendence, message, client)
    }
  }

  async createGame(player1: player, message: joinGameMessage, client: Socket)
  {
    const player2 = new player(message.userId, message.userName, client, 2)
    const game = new pongGame(player1, player2, this.gameRepo, this.gameUserRepo, this.server, message.gameMode)
    await game.createGame()
    this.games.set(game.room, game)
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
      // client.to(room).emit('opponentLeftRoom')
      // client.leave(room)
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

    // this.logger.log('msg received: ' + message.room)
    const game: pongGame = this.games.get(message.room)
    if (!game)
    {
      this.logger.error('moveRacquet: game doesnt exist')
      return
    }
    game.moveRacquet(client.id, message.text)
  }

  async leaveGame(clientWhoLeft: Socket, room: string)
  {
    const game: pongGame = this.games.get(room)
    if (!game)
    {
      this.logger.error('endGame: game doesnt exist')
      return
    }

    const player1Won: boolean = clientWhoLeft === game.player2.clientSocket
    await game.endGame(player1Won)
    this.games.delete(room)
  }

  clearQueue(client: Socket)
  {
    if (this.waitingPlayerClassic && this.waitingPlayerClassic.clientSocket == client)
    {
      this.logger.log('deleting queue')
      delete this.waitingPlayerClassic
      this.waitingPlayerClassic = null
    }
    if (this.waitingPlayerTranscendence && this.waitingPlayerTranscendence.clientSocket == client)
    {
      this.logger.log('deleting queue')
      delete this.waitingPlayerTranscendence
      this.waitingPlayerTranscendence = null
    }
  }  
}
