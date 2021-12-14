'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.player = void 0;
class player {
  constructor(userId, userName, clientSocket, playerNum) {
    this.userId = userId;
    this.userName = userName;
    this.clientSocket = clientSocket;
    this.playerNum = playerNum;
    this.position = 0;
    this.score = 0;
    this.racquetLenght = 0;
    this.isEnlarged = false;
    this.numberOfEnlarge = 0;
  }
}
exports.player = player;
//# sourceMappingURL=pong.player.js.map
