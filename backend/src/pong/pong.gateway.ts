import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { pongGame } from './classes/pong.pongGame';
import { player } from './classes/pong.player';

var INTERVAL_IN_MS = 20
var RACQUET_SPEED = 4

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
  private waitingPlayer: player = null
  
  
  afterInit(server: Server): void {
    this.logger.log('Initialized')
  }
  
  handleDisconnect(client: Socket): void {
    this.logger.log('Client disconected ' + client.id);
    this.games.forEach((value: pongGame, key: string) => {
      if (value.player1.clientSocket.id === client.id || value.player2.clientSocket.id === client.id)
        this.endGame(key)
    })
  }
  
  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.log('Client connected ' + client.id);
  }

  endGame(room: string)
  {
    const game: pongGame = this.games.get(room)
    if (!game)
    {
      this.logger.error('endGame: game doesnt exist')
      return
    }
    clearInterval(game.interval)
    this.logger.log('interval cleared: ' + room )
    game.endGame(true)
    this.games.delete(room)
  }

  @SubscribeMessage('joinGame')
  async handleJoinGameMessage(client: Socket, message: {userId: number}): Promise<void>
  {
    this.logger.log('client joined game. userId: ' + message.userId)
    if (!this.waitingPlayer)
    {
      this.waitingPlayer = new player(message.userId, client)
      client.emit('waitingForOpponent')
    }
    else
    {
      const player2 = new player(message.userId, client)
      const game = new pongGame(this.waitingPlayer, player2, this.gameRepo, this.gameUserRepo)
      delete this.waitingPlayer
      this.waitingPlayer = null

      await game.createGame()
      this.server.to(game.room).emit('gameReadyToStart', game.room)
      this.games.set(game.room, game)
      this.logger.log('new interval: ' + game.room)
      game.interval = setInterval(() => {
        this.sendDatas(client, game.room)
      }, INTERVAL_IN_MS)

    }
  }
  
  @SubscribeMessage('leaveGame')
  handleLeaveRoom(client: Socket, room:string): void
  {
    this.endGame(room)
      // client.to(room).emit('opponentLeftRoom')
      // client.leave(room)
  }


  @SubscribeMessage('moveRacquet')
  handleMoveRacquet(client: Socket, message: {room: string, text: string}): void {

    this.logger.log('msg received: ' + message.room)
    const game: pongGame = this.games.get(message.room)
    if (!game)
    {
      this.logger.error('moveRacquet: game doesnt exist')
      return
    }
    const player = (client.id === game.player1.clientSocket.id) ? game.player1 : game.player2
    if (message.text === 'up')
      player.position -= RACQUET_SPEED
    if (message.text === 'down')
      player.position += RACQUET_SPEED
  }

  sendDatas(client: Socket, room:string): void {

    const game: pongGame = this.games.get(room) // returns a reference to the PongGame object --> any change made to "game" will modify the object inside the map
    if (!game)
    {
      this.logger.error('sendPosition: game doesnt exist')
      return
    }
    game.changeBallDirectionIfNeeded()
    game.computeNewBallPosition()
    
    this.server.to(room).emit('position', game.ballPosition, game.getPlayerPositions(), game.getPlayerScores())
  }
  
}
