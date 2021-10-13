import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { player } from './interfaces/player.interface'

var BALL_SPEED = 1
var INTERVAL_IN_MS = 20
var CANVAS_WIDTH = 640
var CANVAS_HEIGHT = 480
var BALL_INITIAL_DIR_X = -2
var BALL_INITIAL_DIR_Y = -1
var BALL_RADIUS = 10
var RACQUET_LENGTH = 80
var RACQUET_SPEED = 2

type coordinates = {
  x: number,
  y: number
}

type ballAndPlayersPosition = {
  player1: number,
  player2: number,
  ball: coordinates
}

type playerScores = {
  player1: number,
  player2: number
}


class pongGame {

  
  constructor(
  public player1: player, 
  public player2: player,
  private readonly gameRepo: Repository<Game>,
  private readonly gameUserRepo: Repository<GameUser>)
  {
    this.initBallDirection()
    this.initPositions()
  }
  
  private logger: Logger = new Logger('PongGateway');
  
  public room: string
  public gameId: number
  
  public position: ballAndPlayersPosition = {player1: 0, player2:0, ball: {x: 0, y:0}}
  public ballDirection: coordinates = {x: 0, y: 0}
  public score: playerScores = {player1: 0, player2: 0}

  public interval = null

  initPositions()
  {
    this.position.player1 = 200
    this.position.player2 = 200
    this.position.ball.x = CANVAS_WIDTH / 2
    this.position.ball.y = CANVAS_HEIGHT / 2
  }
  initBallDirection()
  {
    this.ballDirection.x = BALL_INITIAL_DIR_X,
    this.ballDirection.y = BALL_INITIAL_DIR_Y
  }
 
  async createGame(): Promise<void>
  {
    // create a game entity and save it to the database
    this.logger.log('game created')
    const game = this.gameRepo.create()
    await this.gameRepo.save(game)

    // create a GameUser entity for player 1 and save it to the database
    const user1game = this.gameUserRepo.create()
    user1game.gameId = game.id
    user1game.userId = this.player1.userId
    await this.gameUserRepo.save(user1game)
    
    // create a GameUser entity for player 2 and save it to the database
    const user2game = this.gameUserRepo.create()
    user2game.gameId = game.id
    user2game.userId = this.player2.userId
    await this.gameUserRepo.save(user2game)

    this.gameId = game.id
    // make player 1 and player 2 join room
    this.room = game.id.toString()
    await this.player1.clientSocket.join(this.room)
    await this.player2.clientSocket.join(this.room)
  }
  
  async endGame(player1Won: boolean): Promise<void>
  {
    await this.gameUserRepo.update({userId: this.player1.userId, gameId: this.gameId}, { won: player1Won})
    await this.gameUserRepo.update({userId: this.player2.userId, gameId: this.gameId}, { won: !player1Won})
  }

}

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
  handleMessage(client: Socket, message: {room: string, text: string}): void {

    this.logger.log('msg received: ' + message.room)
    const game: pongGame = this.games.get(message.room)
    if (!game)
    {
      this.logger.error('moveRacquet: game doesnt exist')
      return
    }

    if (client.id === game.player1.clientSocket.id)
    {
      if (message.text === 'up')
        game.position.player1 -= RACQUET_SPEED
      if (message.text === 'down')
        game.position.player1 += RACQUET_SPEED
    }
    if (client.id === game.player2.clientSocket.id)
    {
      if (message.text === 'up')
        game.position.player2 -= RACQUET_SPEED
      if (message.text === 'down')
        game.position.player2 += RACQUET_SPEED
    }
  }

  sendDatas(client: Socket, room:string): void {

    const game: pongGame = this.games.get(room) // returns a reference to the PongGame object --> any change made to "game" will modify the object inside the map
    if (!game)
    {
      this.logger.error('sendPosition: game doesnt exist')
      return
    }
    this.changeBallDirectionIfWallHit(game)
    
    game.position.ball.x += game.ballDirection.x * BALL_SPEED
    game.position.ball.y += game.ballDirection.y * BALL_SPEED
    this.server.to(room).emit('position', game.position, game.score)
  }
  
  changeBallDirectionIfWallHit(game: pongGame): void
  {
    // if hit top or bottom walls
    if (game.position.ball.y <= BALL_RADIUS || game.position.ball.y >= CANVAS_HEIGHT - BALL_RADIUS)
    {
      game.ballDirection.y = -game.ballDirection.y
    }
    // if hit left left wall
    if (game.position.ball.x <= BALL_RADIUS)
    {
      if (game.position.ball.y >= game.position.player1 && game.position.ball.y <= (game.position.player1 + RACQUET_LENGTH))
        game.ballDirection.x = -game.ballDirection.x
      else
      {
        // score change
        // reset positions (ball + racquet)
        // move ball again
        this.handleScore(true, game)
      }
    }
    // if hit right wall
    if (game.position.ball.x >= CANVAS_WIDTH - BALL_RADIUS)
    {
      if (game.position.ball.y >= game.position.player2 && game.position.ball.y <= (game.position.player2 + RACQUET_LENGTH))
        game.ballDirection.x = -game.ballDirection.x
      else
      {
        this.handleScore(false, game)
      }
    }
  }

  handleScore(player1Scored: boolean, game: pongGame)
  {
    if (player1Scored)
      game.score.player1++
    else
      game.score.player2++
    game.initPositions()
    game.initBallDirection()
  }

}
