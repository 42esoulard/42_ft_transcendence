import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { coordinates, player } from './types/pong.types'

var BALL_SPEED = 1
var INTERVAL_IN_MS = 20
var CANVAS_WIDTH = 640
var CANVAS_HEIGHT = 480
var BALL_INITIAL_DIR_X = -2
var BALL_INITIAL_DIR_Y = -1
var BALL_RADIUS = 10
var RACQUET_LENGTH = 80
var RACQUET_WIDTH = 20
var RACQUET_SPEED = 4



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
  
  public ballPosition: coordinates = {x: 0, y:0}
  public ballDirection: coordinates = {x: 0, y: 0}

  public interval = null

  initPositions()
  {
    this.player1.position = 200
    this.player2.position = 200
    this.ballPosition.x = CANVAS_WIDTH / 2
    this.ballPosition.y = CANVAS_HEIGHT / 2
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
  
  changeBallDirectionIfNeeded(): void
  {
    // if hit top or bottom walls
    if (this.ballPosition.y <= BALL_RADIUS || this.ballPosition.y >= CANVAS_HEIGHT - BALL_RADIUS)
      this.ballDirection.y = -this.ballDirection.y
    
      // if ball arrives towards player1
    if (this.ballPosition.x <= RACQUET_WIDTH + BALL_RADIUS) 
    {
      // case 1: player1 hits the ball
      if (this.ballPosition.y >= this.player1.position && 
      this.ballPosition.y <= (this.player1.position + RACQUET_LENGTH))
        this.ballDirection.x = -this.ballDirection.x
      // case2: player2 scores
      // if (game.ballPosition.x <= 0 - BALL_RADIUS)
      else  
        this.handleScore(false)
    }
    // if ball arrives towards player2
    if (this.ballPosition.x >= CANVAS_WIDTH - BALL_RADIUS - RACQUET_WIDTH)
    {
      if(this.ballPosition.y >= this.player2.position && 
      this.ballPosition.y <= (this.player2.position + RACQUET_LENGTH))
        this.ballDirection.x = -this.ballDirection.x
      // if (game.ballPosition.x >= CANVAS_WIDTH + BALL_RADIUS)
      else
        this.handleScore(true)
    }
  }
  computeNewBallPosition()
  {
    this.ballPosition.x += this.ballDirection.x * BALL_SPEED
    this.ballPosition.y += this.ballDirection.y * BALL_SPEED
  }
  handleScore(player1Scored: boolean)
  {
    if (player1Scored)
      this.player1.score++
    else
      this.player2.score++
    this.initPositions()
    this.initBallDirection()
  }
  getPlayerPositions()
  {
    return {player1: this.player1.position, player2: this.player2.position}
  }
  getPlayerScores()
  {
    return {player1: this.player1.score, player2: this.player2.score}
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
