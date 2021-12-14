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
Object.defineProperty(exports, '__esModule', { value: true });
exports.PresenceGateway = void 0;
const websockets_1 = require('@nestjs/websockets');
const socket_io_1 = require('socket.io');
const user_interface_1 = require('../users/interfaces/user.interface');
const FRONT_URL = `${process.env['FRONT_URL']}`;
const FRONT_URL_BIS = `${process.env['FRONT_URL_BIS']}`;
let PresenceGateway = class PresenceGateway {
  constructor() {
    this.connectedUsers = [];
  }
  async handleConnection(client, ...args) {
    if (this.connectedUsers.length != 0) {
      client.emit('allConnectedUsers', this.connectedUsers);
    }
    client.on('newConnection', (newUser) => {
      const currentUser = {
        id: newUser.id,
        username: newUser.username,
        socket_ids: [],
      };
      currentUser.socket_ids.push(client.id);
      let user = this.connectedUsers.find((u) => u.id === newUser.id);
      if (user) {
        user.socket_ids.push(client.id);
      } else {
        this.connectedUsers.push(currentUser);
        client.broadcast.emit('newUser', newUser);
        client.emit('newUser', newUser);
      }
    });
    client.on('closeConnection', (leftUser) => {
      let user = this.connectedUsers.find((u) => u.id === leftUser.id);
      if (user) {
        this.connectedUsers = this.connectedUsers.filter(
          (u) => u.id !== user.id,
        );
        client.broadcast.emit('leftUser', user.id);
        client.emit('disconnected');
      }
    });
  }
  async handleDisconnect(client) {
    let user = this.connectedUsers.find((u) =>
      u.socket_ids.find((s) => s === client.id),
    );
    if (user) {
      user.socket_ids = user.socket_ids.filter((s) => s !== client.id);
      if (user.socket_ids.length == 0) {
        this.connectedUsers = this.connectedUsers.filter(
          (u) => u.id !== user.id,
        );
        client.broadcast.emit('leftUser', user.id);
        client.emit('disconnected');
      }
    }
  }
  afterInit(server) {}
};
__decorate(
  [
    (0, websockets_1.WebSocketServer)(),
    __metadata('design:type', socket_io_1.Server),
  ],
  PresenceGateway.prototype,
  'server',
  void 0,
);
PresenceGateway = __decorate(
  [
    (0, websockets_1.WebSocketGateway)({
      namespace: '/presence',
      cors: {
        origin: [FRONT_URL, FRONT_URL_BIS],
        credentials: true,
      },
    }),
  ],
  PresenceGateway,
);
exports.PresenceGateway = PresenceGateway;
//# sourceMappingURL=presence.gateway.js.map
