"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const channels_service_1 = require("../channels/channels.service");
const messages_entity_1 = require("../messages/entity/messages.entity");
const user_interface_1 = require("../users/interfaces/user.interface");
let ChatGateway = class ChatGateway {
    constructor(channelsService) {
        this.channelsService = channelsService;
    }
    async handleConnection(client) {
        console.log('A client has connected to the chat');
        client.on('newConnection', async (user) => {
            if (user) {
                await this.channelsService.getNotifications(user.id).then((res) => {
                    if (res) {
                        client.emit('chatNotifications');
                    }
                });
            }
        });
        client.on('chatOff', () => {
            client.emit('chatOff');
        });
        client.on('chat-message-on', async (data) => {
            if (data) {
                client.emit('chat-message-on', data);
            }
        });
        client.on('chat-message-off', async (data, user) => {
            if (data) {
                await this.channelsService
                    .getNewNotification(data, user.id)
                    .then((res) => {
                    if (res) {
                        client.emit('chatNotifications');
                    }
                })
                    .catch((err) => console.log('Caught error:', err));
            }
        });
        client.on('chat-message', async (message, onlineUsers) => {
            if (message && onlineUsers) {
                client.broadcast.emit('chat-message', message);
                await this.channelsService
                    .notifyOfflineUsers(message, onlineUsers)
                    .catch((err) => {
                    console.log('Caught error:', err);
                });
            }
        });
        client.on('chat-action', async (action, userId, chanName) => {
            client.broadcast.emit('chat-action', action, userId, chanName);
        });
        client.on('chat-action-del', async (message, members) => {
            client.broadcast.emit('chat-action-del', message, members);
        });
        client.on('profile-dm', (recipient) => {
            if (recipient) {
                client.emit('app-dm', recipient);
            }
        });
        client.on('userlist-dm', (recipient) => {
            if (recipient) {
                client.emit('app-dm', recipient);
            }
        });
        client.on('init-direct-message', (recipient) => {
            if (recipient) {
                client.emit('create-direct-message', recipient);
            }
        });
    }
    async handleDisconnect(client) {
        console.log('A client has disconnected');
        client.disconnect();
    }
    handleCreateChannel(client, info) {
        client.emit('created-channel', info);
        client.broadcast.emit('update-channels', info);
    }
    handleUpdateChannels(client, info) {
        client.broadcast.emit('update-channels', info);
    }
    handleJoinChannel(client, channel) {
        client.join(channel);
    }
    handleLeaveChannel(client, channel) {
        client.leave(channel);
    }
    handleBannedUser(client, user) {
        client.broadcast.emit('bannedUser', user);
    }
    handleDeletedUser(client, user) {
        client.broadcast.emit('deletedUser', user);
    }
    handleSelfDeletedUser(client, user) {
        client.broadcast.emit('selfdeletedUser', user);
    }
    handleDemotedUser(client, user) {
        client.broadcast.emit('demotedUser', user);
    }
    handlePromotedUser(client, user) {
        client.broadcast.emit('promotedUser', user);
    }
    handleNewFriendshipRequest(client, adressee) {
        client.broadcast.emit('newFriendshipRequest', adressee);
    }
    handleIsAlreadyConnected(client, user) {
        client.broadcast.emit('isAlreadyConnected', user);
    }
    async onLeave(user, client) {
        console.log(user, ' left');
        client.broadcast.emit('leave', user);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleConnection", null);
__decorate([
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDisconnect", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createChannel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleCreateChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('update-channels'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleUpdateChannels", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveChannel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('bannedUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_interface_1.User]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleBannedUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('deletedUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_interface_1.User]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleDeletedUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('selfdeletedUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_interface_1.User]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleSelfDeletedUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('demotedUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_interface_1.User]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleDemotedUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('promotedUser'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_interface_1.User]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handlePromotedUser", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('newFriendshipRequest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_interface_1.User]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleNewFriendshipRequest", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('isAlreadyConnected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, user_interface_1.User]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleIsAlreadyConnected", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onLeave", null);
ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/chat',
        cors: {
            origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [channels_service_1.ChannelsService])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map