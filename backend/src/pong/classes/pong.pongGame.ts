import { coordinates } from './pong.types'
import { player } from './pong.player'
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entity/games.entity';
import { GameUser } from '../entity/gameUser.entity';
import { Server } from 'socket.io';

var BALL_SPEED = 1
var CANVAS_WIDTH = 640
var CANVAS_HEIGHT = 480
var BALL_INITIAL_DIR_X = -2
var BALL_INITIAL_DIR_Y = -1
var BALL_RADIUS = 10
var RACQUET_LENGTH = 80
var RACQUET_WIDTH = 20
var RACQUET_SPEED = 4
var SCORE_NEEDED_TO_WIN = 2
var INTERVAL_IN_MS = 20

export class pongGame {

  constructor(
  public player1: player, 
  public player2: player,
  private readonly gameRepo: Repository<Game>,
  private readonly gameUserRepo: Repository<GameUser>,
  public server: Server)
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

  async pushGameintoDB()
  {
    const game = this.gameRepo.create()
    await this.gameRepo.save(game)
    this.gameId = game.id
  }

  async pushGameUsersintoDB()
  {
    // push a GameUser entity for player 1
    const user1game = this.gameUserRepo.create()
    user1game.gameId = this.gameId
    user1game.userId = this.player1.userId
    await this.gameUserRepo.save(user1game)
    
    // push a GameUser entity for player 2
    const user2game = this.gameUserRepo.create()
    user2game.gameId = this.gameId
    user2game.userId = this.player2.userId
    await this.gameUserRepo.save(user2game)

  }

  async createGame(): Promise<void>
  {
    this.logger.log('game created')

    await this.pushGameintoDB()
    await this.pushGameUsersintoDB()

    // make player 1 and player 2 join room
    this.room = this.gameId.toString()
    await this.player1.clientSocket.join(this.room)
    await this.player2.clientSocket.join(this.room)
    
    this.server.to(this.room).emit('gameReadyToStart', this.room, this.player1.userName, this.player2.userName)
    this.interval = setInterval(() => {
      this.sendBallPosition()
    }, INTERVAL_IN_MS)
  }
  
  async endGame(player1Won: boolean): Promise<void>
  {
    clearInterval(this.interval)
    await this.gameUserRepo.update({userId: this.player1.userId, gameId: this.gameId}, { won: player1Won})
    await this.gameUserRepo.update({userId: this.player2.userId, gameId: this.gameId}, { won: !player1Won})
    this.server.to(this.room).emit('gameOver')
  }
 
  sendBallPosition(): void
  {

    this.changeBallDirectionIfNeeded()
    this.computeNewBallPosition()
    
    this.server.to(this.room).emit('position', this.ballPosition, this.getPlayerPositions(), this.getPlayerScores())
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
    if (this.player1.score >= SCORE_NEEDED_TO_WIN)
      this.endGame(true)
    if (this.player2.score >= SCORE_NEEDED_TO_WIN)
      this.endGame(false)
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
  moveRacquet(clientId: string, direction:string)
  {
    const player = (clientId === this.player1.clientSocket.id) ? this.player1 : this.player2
    if (direction === 'up')
      player.position -= RACQUET_SPEED
    if (direction === 'down')
      player.position += RACQUET_SPEED
  }
}
