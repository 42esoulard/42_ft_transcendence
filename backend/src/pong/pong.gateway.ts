import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';

var BALL_SPEED = 1
var INTERVAL_IN_MS = 20
var CANVAS_WIDTH = 640
var CANVAS_HEIGHT = 480
var BALL_INITIAL_DIR_X = -2
var BALL_INITIAL_DIR_Y = -1
var BALL_RADIUS = 10
var RACQUET_LENGTH = 80
var RACQUET_SPEED = 2


class player {
  constructor(userId: number, clientSocket: Socket) {
    this.userId = userId,
    this.clientSocket = clientSocket
  }
  userId: number;
  clientSocket: Socket
  gameId: number
}

class pongGame {

  constructor(
  public player1: player, 
  public player2: player,
  private readonly gameRepo: Repository<Game>,
  private readonly gameUserRepo: Repository<GameUser>)
  {
    this.player1 = player1,
    this.player2 = player2 
  }
  
  private logger: Logger = new Logger('PongGateway');
  public room: string
  public position = {
    player1: 200,
    player2: 200,
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2
    },
  }

  public ballDirection = {
    x: BALL_INITIAL_DIR_X,
    y: BALL_INITIAL_DIR_Y
  }

  public interval = null

  async createGame()
  {
    // create a game entity and save it to the database
    this.logger.log('game created')
    const game = this.gameRepo.create()
    await this.gameRepo.save(game)
    this.player1.gameId = game.id
    this.player2.gameId = game.id

    // create a GameUser entity for player 1 and save it to the database
    const user1game = this.gameUserRepo.create()
    user1game.gameId = this.player1.gameId
    user1game.userId = this.player1.userId
    await this.gameUserRepo.save(user1game)
    
    // create a GameUser entity for player 2 and save it to the database
    const user2game = this.gameUserRepo.create()
    user2game.gameId = this.player2.gameId
    user2game.userId = this.player2.userId
    await this.gameUserRepo.save(user2game)


    this.room = game.id.toString()
    await this.player1.clientSocket.join(this.room)
    await this.player2.clientSocket.join(this.room)
  }
  
  async endGame(player1Won: boolean)
  {
    await this.gameUserRepo.update({userId: this.player1.userId, gameId: this.player1.gameId}, { won: player1Won})
    await this.gameUserRepo.update({userId: this.player2.userId, gameId: this.player2.gameId}, { won: !player1Won})
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

  // private pongGame: pongGame
  private games = new Map() // pongGame map. key = room id
  private waitingPlayer: player = null
  
  
  afterInit(server: Server) {
    this.logger.log('Initialized')
  }
  
  handleDisconnect(client: Socket) {
    // if (client.id === this.clients.client1)
    //   this.clients.client1 = ''
    // if (client.id === this.clients.client2)
    //   this.clients.client2 = ''

    this.logger.log('Client disconected ' + client.id);
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected ' + client.id);
    // client.emit('position', this.pongGame.position)
  }

  @SubscribeMessage('joinGame')
  async handleJoinGameMessage(client: Socket, message: {userId: number})
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
        this.moveBall(client, game.room)
      }, INTERVAL_IN_MS)


      // just to test that endGame works correctly
      // game.endGame(false)
    }
  }

  @SubscribeMessage('moveRacquet')
  handleMessage(client: Socket, message: {room: string, text: string}): void {

    this.logger.log('msg received: ' + message.text)
    this.logger.log(message.room)
    const game: pongGame = this.games.get(message.room)

    if (client.id === game.player1.clientSocket.id)
    {
      if (message.text === 'up')
        game.position.player1 -= RACQUET_SPEED
      if (message.text === 'down')
        game.position.player1 += RACQUET_SPEED
    }
    if (client.id === game.player2.clientSocket.id)
    {
      this.logger.log('there')
      if (message.text === 'up')
        game.position.player2 -= RACQUET_SPEED
      if (message.text === 'down')
        game.position.player2 += RACQUET_SPEED
    }
    // this.server.to(message.room).emit('position', this.position);
  }


  moveBall(client: Socket, room:string) {

    this.changeBallDirectionIfWallHit(room)
    const game = this.games.get(room) // returns a reference to the PongGame object --> any change made to "game" will modify the object inside the map
    
    game.position.ball.x += game.ballDirection.x * BALL_SPEED
    game.position.ball.y += game.ballDirection.y * BALL_SPEED
    this.server.to(room).emit('position', game.position)
  }
  
  changeBallDirectionIfWallHit(room: string)
  {
    const game = this.games.get(room)
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
        game.ballDirection.x = 0,
        game.ballDirection.y = 0
      }
    }
    // if hit right wall
    if (game.position.ball.x >= CANVAS_WIDTH - BALL_RADIUS)
    {
      if (game.position.ball.y >= game.position.player2 && game.position.ball.y <= (game.position.player2 + RACQUET_LENGTH))
        game.ballDirection.x = -game.ballDirection.x
      else
      {
        game.ballDirection.x = 0,
        game.ballDirection.y = 0
      }
    }
  }

  @SubscribeMessage('leaveGame')
  handleLeaveRoom(client: Socket, room:string)
  {
    const game: pongGame = this.games.get(room)
    clearInterval(game.interval)
    this.logger.log('interval cleared: ' + room )
    // client.to(room).emit('opponentLeftRoom')
    // client.leave(room)
  }
}
