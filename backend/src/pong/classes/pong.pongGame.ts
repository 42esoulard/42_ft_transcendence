import { coordinates } from './pong.types'
import { player } from './pong.player'
import { Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Game } from '../entity/games.entity';
import { GameUser } from '../entity/gameUser.entity';

var BALL_SPEED = 1
var CANVAS_WIDTH = 640
var CANVAS_HEIGHT = 480
var BALL_INITIAL_DIR_X = -2
var BALL_INITIAL_DIR_Y = -1
var BALL_RADIUS = 10
var RACQUET_LENGTH = 80
var RACQUET_WIDTH = 20
var RACQUET_SPEED = 4

export class pongGame {

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
  moveRacquet(clientId: string, direction:string)
  {
    const player = (clientId === this.player1.clientSocket.id) ? this.player1 : this.player2
    if (direction === 'up')
      player.position -= RACQUET_SPEED
    if (direction === 'down')
      player.position += RACQUET_SPEED
  }
}