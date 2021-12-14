'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === 'object' && typeof Reflect.metadata === 'function')
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.PongGateway = void 0;
const common_1 = require('@nestjs/common');
const typeorm_1 = require('@nestjs/typeorm');
const websockets_1 = require('@nestjs/websockets');
const socket_io_1 = require('socket.io');
const typeorm_2 = require('typeorm');
const games_entity_1 = require('./entity/games.entity');
const gameUser_entity_1 = require('./entity/gameUser.entity');
const pong_pongGame_1 = require('./classes/pong.pongGame');
const pong_player_1 = require('./classes/pong.player');
const pong_challenge_1 = require('./classes/pong.challenge');
const users_entity_1 = require('../users/entity/users.entity');
let PongGateway = class PongGateway {
  constructor(gameRepo, gameUserRepo, userRepo) {
    this.gameRepo = gameRepo;
    this.gameUserRepo = gameUserRepo;
    this.userRepo = userRepo;
    this.logger = new common_1.Logger('PongGateway');
    this.games = new Map();
    this.waitingPlayerClassic = null;
    this.waitingPlayerTranscendence = null;
    this.pendingChallenges = new Map();
  }
  afterInit(server) {}
  handleDisconnect(client) {
    this.logger.log('Client disconected ' + client.id);
    this.clearQueue(client);
    this.leaveGameIfPlaying(client);
    this.removeSpectatorIfWatching(client);
    this.cancelChallengeIfChallenging(client);
  }
  leaveGameIfPlaying(client) {
    this.games.forEach((game) => {
      if (
        game.player1.clientSocket.id === client.id ||
        game.player2.clientSocket.id === client.id
      )
        this.leaveGame(client, game.room);
    });
  }
  removeSpectatorIfWatching(client) {
    this.games.forEach((game) => {
      if (game.spectators.includes(client))
        this.stopWatching(client, game.room);
    });
  }
  cancelChallengeIfChallenging(client) {
    this.pendingChallenges.forEach((pendingChallenge) => {
      if (pendingChallenge.challengerSocket.id === client.id)
        this.cancelChallenge(pendingChallenge.challengerName);
    });
  }
  handleConnection(client, ...args) {
    this.logger.log('Client connected ' + client.id);
    this.sendPlayingUsers(client);
    this.sendPendingChallenges(client);
  }
  sendPlayingUsers(client) {
    var playingUsers = [];
    this.games.forEach((game) => {
      playingUsers.push(game.player1.userName, game.player2.userName);
    });
    if (playingUsers.length) client.emit('allPlayingUsers', playingUsers);
  }
  sendPendingChallenges(client) {
    var pendingChallengesArray = [];
    this.pendingChallenges.forEach((challenge) => {
      pendingChallengesArray.push({
        challengerName: challenge.challengerName,
        challengeeName: challenge.challengeeName,
        expiry_date: challenge.expiry_date,
      });
    });
    client.emit('allPendingChallenges', pendingChallengesArray);
  }
  async handleAskToPlay(client, message) {
    const newChallenge = new pong_challenge_1.challenge(
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
  }
  async handleCancelChallenge(client, challengerName) {
    this.cancelChallenge(challengerName);
  }
  async handleAcceptChallenge(client, challengerName) {
    const challenge = this.pendingChallenges.get(challengerName);
    if (!challenge) {
      this.logger.log('challenge does not exist');
      return;
    }
    const player1 = new pong_player_1.player(
      challenge.challengeeId,
      challenge.challengeeName,
      client,
      1,
    );
    const player2 = new pong_player_1.player(
      challenge.challengerId,
      challenge.challengerName,
      challenge.challengerSocket,
      2,
    );
    this.createGame(client, player1, player2, challenge.gameMode).catch();
  }
  async handleDeclineChallenge(client, challengerName) {
    const challenge = this.pendingChallenges.get(challengerName);
    if (!challenge) {
      this.logger.log('challenge does not exist');
      return;
    }
    challenge.challengerSocket.emit('challengeDeclined');
    this.pendingChallenges.delete(challengerName);
  }
  async handleJoinGameMessage(client, message) {
    if (this.userIsAlreadyInQueue(client, message.userId)) return;
    if (message.gameMode === 'classic') {
      if (!this.waitingPlayerClassic) this.addPlayerToQueue(client, message);
      else {
        const player2 = new pong_player_1.player(
          message.userId,
          message.userName,
          client,
          2,
        );
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
        const player2 = new pong_player_1.player(
          message.userId,
          message.userName,
          client,
          2,
        );
        this.createGame(
          client,
          this.waitingPlayerTranscendence,
          player2,
          message.gameMode,
        ).catch();
      }
    }
  }
  addPlayerToQueue(client, message) {
    if (message.gameMode === 'classic')
      this.waitingPlayerClassic = new pong_player_1.player(
        message.userId,
        message.userName,
        client,
        1,
      );
    if (message.gameMode === 'transcendence')
      this.waitingPlayerTranscendence = new pong_player_1.player(
        message.userId,
        message.userName,
        client,
        1,
      );
    client.emit('addedToQueue');
  }
  async handleWatchGame(client, gameId) {
    const game = this.games.get(gameId);
    if (!game) {
      this.logger.log('game does not exist');
      return;
    }
    game.addSpectator(client);
  }
  handleLeaveQueue(client) {
    this.clearQueue(client);
  }
  handleLeaveGame(client, room) {
    this.leaveGame(client, room);
  }
  handleStopWatching(client, room) {
    this.stopWatching(client, room);
  }
  handleEnlargeRacquet(client, room) {
    const game = this.games.get(room);
    if (!game) {
      this.logger.log('game does not exist');
      return;
    }
    game.enlargeRacquet(client);
  }
  handleMoveRacquet(client, message) {
    const game = this.games.get(message.room);
    if (!game) {
      this.logger.log('game does not exist');
      return;
    }
    game.moveRacquet(client, message.text);
  }
  userIsAlreadyInQueue(client, userId) {
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
  async createGame(client, player1, player2, gameMode) {
    let enemy;
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
    const game = new pong_pongGame_1.pongGame(
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
  async leaveGame(clientWhoLeft, room) {
    const game = this.games.get(room);
    if (!game) return;
    if (game.isOver === true) {
      this.games.delete(room);
      return;
    }
    const player1Won = clientWhoLeft === game.player2.clientSocket;
    await game.endGame(player1Won);
    this.games.delete(room);
  }
  async stopWatching(client, room) {
    const game = this.games.get(room);
    if (!game) return;
    game.removeSpectator(client);
  }
  clearQueue(client) {
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
  cancelChallenge(challengerName) {
    this.pendingChallenges.delete(challengerName);
    this.server.emit('challengeCancelled', challengerName);
  }
};
__decorate(
  [
    (0, websockets_1.WebSocketServer)(),
    __metadata('design:type', socket_io_1.Server),
  ],
  PongGateway.prototype,
  'server',
  void 0,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('challengeRequest'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
    __metadata('design:returntype', Promise),
  ],
  PongGateway.prototype,
  'handleAskToPlay',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('cancelChallenge'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, String]),
    __metadata('design:returntype', Promise),
  ],
  PongGateway.prototype,
  'handleCancelChallenge',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('challengeAccepted'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, String]),
    __metadata('design:returntype', Promise),
  ],
  PongGateway.prototype,
  'handleAcceptChallenge',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('challengeDeclined'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, String]),
    __metadata('design:returntype', Promise),
  ],
  PongGateway.prototype,
  'handleDeclineChallenge',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('joinGame'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
    __metadata('design:returntype', Promise),
  ],
  PongGateway.prototype,
  'handleJoinGameMessage',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('watchGame'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, String]),
    __metadata('design:returntype', Promise),
  ],
  PongGateway.prototype,
  'handleWatchGame',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('leaveQueue'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket]),
    __metadata('design:returntype', void 0),
  ],
  PongGateway.prototype,
  'handleLeaveQueue',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('leaveGame'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, String]),
    __metadata('design:returntype', void 0),
  ],
  PongGateway.prototype,
  'handleLeaveGame',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('stopWatching'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, String]),
    __metadata('design:returntype', void 0),
  ],
  PongGateway.prototype,
  'handleStopWatching',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('enlargeRacquet'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, String]),
    __metadata('design:returntype', void 0),
  ],
  PongGateway.prototype,
  'handleEnlargeRacquet',
  null,
);
__decorate(
  [
    (0, websockets_1.SubscribeMessage)('moveRacquet'),
    __metadata('design:type', Function),
    __metadata('design:paramtypes', [socket_io_1.Socket, Object]),
    __metadata('design:returntype', void 0),
  ],
  PongGateway.prototype,
  'handleMoveRacquet',
  null,
);
PongGateway = __decorate(
  [
    (0, websockets_1.WebSocketGateway)({ namespace: '/pong' }),
    __param(0, (0, typeorm_1.InjectRepository)(games_entity_1.Game)),
    __param(1, (0, typeorm_1.InjectRepository)(gameUser_entity_1.GameUser)),
    __param(2, (0, typeorm_1.InjectRepository)(users_entity_1.Users)),
    __metadata('design:paramtypes', [
      typeorm_2.Repository,
      typeorm_2.Repository,
      typeorm_2.Repository,
    ]),
  ],
  PongGateway,
);
exports.PongGateway = PongGateway;
//# sourceMappingURL=pong.gateway.js.map
