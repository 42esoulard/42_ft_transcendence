'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.pongGame = void 0;
const common_1 = require('@nestjs/common');
const users_entity_1 = require('../../users/entity/users.entity');
var CANVAS_WIDTH = 1 / Number(process.env['CANVAS_WIDTH']);
var CANVAS_HEIGHT = 1 / Number(process.env['CANVAS_HEIGHT']);
var BALL_RADIUS = 1 / Number(process.env['BALL_RADIUS']);
var RACQUET_LENGTH_CLASSIC = 1 / Number(process.env['RACQUET_LENGTH_CLASSIC']);
var RACQUET_LENGTH_TRANSCENDENCE =
  1 / Number(process.env['RACQUET_LENGTH_TRANSCENDENCE']);
var RACQUET_WIDTH = 1 / Number(process.env['RACQUET_WIDTH']);
var BALL_INITIAL_SPEED = 1 / Number([process.env['BALL_INITIAL_SPEED']]);
var BALL_ACCELERATION = 1 / Number([process.env['BALL_ACCELERATION']]);
var RACQUET_SPEED = 1 / Number([process.env['RACQUET_SPEED']]);
var SCORE_NEEDED_TO_WIN = Number(process.env['SCORE_NEEDED_TO_WIN']);
var INTERVAL_IN_MS = Number(process.env['INTERVAL_IN_MS']);
var INITAL_DELAY_IN_MS = Number(process.env['INITIAL_DELAY_IN_MS']);
var DELAY_AFTER_SCORE_IN_MS = Number(process.env['DELAY_AFTER_SCORE_IN_MS']);
class pongGame {
  constructor(
    player1,
    player2,
    gameRepo,
    gameUserRepo,
    userRepo,
    server,
    gameMode,
  ) {
    this.player1 = player1;
    this.player2 = player2;
    this.gameRepo = gameRepo;
    this.gameUserRepo = gameUserRepo;
    this.userRepo = userRepo;
    this.server = server;
    this.gameMode = gameMode;
    this.logger = new common_1.Logger('PongGateway');
    this.isOver = false;
    this.ballPosition = { x: 0, y: 0 };
    this.ballDirection = { x: 0, y: 0 };
    this.ballSpeed = 0;
    this.interval = null;
    this.timeout = null;
    this.spectators = [];
    this.initRacquetLength();
  }
  initPositions() {
    this.player1.position = CANVAS_HEIGHT / 2 - this.player1.racquetLenght / 2;
    this.player2.position = CANVAS_HEIGHT / 2 - this.player2.racquetLenght / 2;
    this.ballPosition.x = CANVAS_WIDTH / 2;
    this.ballPosition.y = CANVAS_HEIGHT / 2;
  }
  initBallDirection() {
    var rand1 = Math.random() > 0.5;
    rand1 ? (this.ballDirection.x = 2) : (this.ballDirection.x = -2);
    var rand2 = Math.random() > 0.5;
    rand2 ? (this.ballDirection.y = 1) : (this.ballDirection.y = -1);
  }
  initRacquetLength() {
    if (this.gameMode == 'classic') {
      this.player1.racquetLenght = RACQUET_LENGTH_CLASSIC;
      this.player2.racquetLenght = RACQUET_LENGTH_CLASSIC;
    }
    if (this.gameMode == 'transcendence') {
      this.player1.racquetLenght = RACQUET_LENGTH_TRANSCENDENCE;
      this.player2.racquetLenght = RACQUET_LENGTH_TRANSCENDENCE;
    }
  }
  async pushGameintoDB() {
    const game = this.gameRepo.create();
    game.gameMode = this.gameMode;
    await this.gameRepo.save(game);
    this.gameId = game.id;
  }
  async pushGameUsersintoDB() {
    const user1game = this.gameUserRepo.create();
    user1game.gameId = this.gameId;
    user1game.userId = this.player1.userId;
    await this.gameUserRepo.save(user1game);
    const user2game = this.gameUserRepo.create();
    user2game.gameId = this.gameId;
    user2game.userId = this.player2.userId;
    await this.gameUserRepo.save(user2game);
  }
  async createGame() {
    const usr1 = await this.userRepo.findOne(this.player1.userId);
    if (!usr1) throw new common_1.BadRequestException("user doesn't exist");
    const usr2 = await this.userRepo.findOne(this.player2.userId);
    if (!usr2) throw new common_1.BadRequestException("user doesn't exist");
    await this.pushGameintoDB();
    await this.pushGameUsersintoDB();
    this.room = this.gameId.toString();
    await this.player1.clientSocket.join(this.room);
    await this.player2.clientSocket.join(this.room);
    this.server
      .to(this.room)
      .emit(
        'gameReadyToStart',
        this.room,
        this.player1.userName,
        this.player2.userName,
        this.gameMode,
      );
    this.spectatorWarnNewGame();
    this.timeout = setTimeout(() => {
      this.server.to(this.room).emit('gameStarting');
      this.startFromCenter();
    }, INITAL_DELAY_IN_MS);
  }
  async spectatorWarnNewGame() {
    const game = await this.gameRepo.findOne(this.gameId, {
      relations: ['users', 'users.user'],
    });
    this.server.emit('newGame', game);
  }
  async addSpectator(client) {
    client.join(this.room);
    this.spectators.push(client);
    client.emit(
      'GoToGame',
      this.room,
      this.player1.userName,
      this.player2.userName,
      this.gameMode,
    );
    if (this.player1.score || this.player2.score)
      client.emit('score', this.getPlayerScores());
  }
  removeSpectator(client) {
    client.leave(this.room);
    this.spectators = this.spectators.filter(
      (spectator) => spectator.id != client.id,
    );
  }
  startFromCenter() {
    this.initPositions();
    this.initBallDirection();
    this.ballSpeed = BALL_INITIAL_SPEED;
    this.interval = setInterval(() => {
      this.updateGame();
    }, INTERVAL_IN_MS);
  }
  async endGame(player1Won) {
    this.isOver = true;
    clearTimeout(this.timeout);
    clearInterval(this.interval);
    this.spectatorWarnEndGame();
    await this.gameUserRepo.update(
      { userId: this.player1.userId, gameId: this.gameId },
      { won: player1Won },
    );
    await this.gameUserRepo.update(
      { userId: this.player2.userId, gameId: this.gameId },
      { won: !player1Won },
    );
    await this.gameRepo.update(this.gameId, {
      score1: this.player1.score,
      score2: this.player2.score,
    });
    this.server.to(this.room).emit('gameOver', player1Won);
    this.server.emit('removeInGameUsers', [
      this.player1.userName,
      this.player2.userName,
    ]);
  }
  async spectatorWarnEndGame() {
    const game = await this.gameRepo.findOne(this.gameId, {
      relations: ['users', 'users.user'],
    });
    this.server.emit('endGame', game);
  }
  updateGame() {
    this.server
      .to(this.room)
      .emit('position', this.ballPosition, this.getPlayerPositions());
    this.updateScore();
    this.updateBallDirection();
    this.updateBallPosition();
  }
  updateScore() {
    if (this.ballPosition.x + BALL_RADIUS < 0) this.handleScore(false);
    if (this.ballPosition.x - BALL_RADIUS > CANVAS_WIDTH)
      this.handleScore(true);
  }
  updateBallDirection() {
    if (
      this.ballPosition.y <= BALL_RADIUS ||
      this.ballPosition.y >= CANVAS_HEIGHT - BALL_RADIUS
    )
      this.ballDirection.y = -this.ballDirection.y;
    if (this.ballCollisionWithPlayer1() || this.ballCollisionWithPlayer2()) {
      this.ballDirection.x = -this.ballDirection.x;
      this.accelerateBall();
    }
  }
  accelerateBall() {
    if (
      this.ballSpeed * 2 + BALL_ACCELERATION * 2 <
      RACQUET_WIDTH + BALL_RADIUS
    )
      this.ballSpeed += BALL_ACCELERATION;
  }
  ballCollisionWithPlayer1() {
    if (
      this.ballDirection.x < 0 &&
      this.ballPosition.x - BALL_RADIUS <= RACQUET_WIDTH &&
      this.ballPosition.x >= 0 &&
      this.ballPosition.y <=
        this.player1.position + this.player1.racquetLenght &&
      this.ballPosition.y >= this.player1.position
    )
      return true;
    return false;
  }
  ballCollisionWithPlayer2() {
    if (
      this.ballDirection.x > 0 &&
      this.ballPosition.x <= CANVAS_WIDTH &&
      this.ballPosition.x + BALL_RADIUS >= CANVAS_WIDTH - RACQUET_WIDTH &&
      this.ballPosition.y <=
        this.player2.position + this.player2.racquetLenght &&
      this.ballPosition.y >= this.player2.position
    )
      return true;
    return false;
  }
  updateBallPosition() {
    this.ballPosition.x += this.ballDirection.x * this.ballSpeed;
    this.ballPosition.y += this.ballDirection.y * this.ballSpeed;
  }
  handleScore(player1Scored) {
    if (player1Scored) this.player1.score++;
    else this.player2.score++;
    this.server.to(this.room).emit('score', this.getPlayerScores());
    if (this.player1.score >= SCORE_NEEDED_TO_WIN) {
      this.endGame(true);
      return;
    }
    if (this.player2.score >= SCORE_NEEDED_TO_WIN) {
      this.endGame(false);
      return;
    }
    this.restartFromCenter();
  }
  restartFromCenter() {
    clearInterval(this.interval);
    this.timeout = setTimeout(() => {
      this.startFromCenter();
    }, DELAY_AFTER_SCORE_IN_MS);
  }
  getPlayerPositions() {
    return { player1: this.player1.position, player2: this.player2.position };
  }
  getPlayerScores() {
    return { player1: this.player1.score, player2: this.player2.score };
  }
  moveRacquet(client, direction) {
    const player =
      client.id === this.player1.clientSocket.id ? this.player1 : this.player2;
    var topOfTheRacquet = player.position;
    if (direction === 'up' && topOfTheRacquet > 0)
      player.position -= Math.min(RACQUET_SPEED, topOfTheRacquet);
    var bottomOfTheRacquet = player.position + player.racquetLenght;
    if (direction === 'down' && bottomOfTheRacquet < CANVAS_HEIGHT)
      player.position += Math.min(
        RACQUET_SPEED,
        CANVAS_HEIGHT - bottomOfTheRacquet,
      );
  }
  enlargeRacquet(client) {
    const player =
      client.id === this.player1.clientSocket.id ? this.player1 : this.player2;
    if (player.isEnlarged == false && player.numberOfEnlarge < 3) {
      player.isEnlarged = true;
      player.numberOfEnlarge++;
      player.racquetLenght *= 2;
      this.server.to(this.room).emit('enlarge', player.playerNum);
      setTimeout(() => {
        player.isEnlarged = false;
        player.racquetLenght /= 2;
        this.server.to(this.room).emit('enlargeEnd', player.playerNum);
      }, 4000);
    }
  }
}
exports.pongGame = pongGame;
//# sourceMappingURL=pong.pongGame.js.map
