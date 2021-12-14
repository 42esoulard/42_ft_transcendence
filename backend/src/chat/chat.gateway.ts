import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/channels/channels.service';
import { Messages } from 'src/messages/entity/messages.entity';
import { Relationship } from 'src/relationships/interfaces/relationship.interface';
import { User } from 'src/users/interfaces/user.interface';

const FRONT_URL = `${process.env['FRONT_URL']}`;
const FRONT_URL_BIS = `${process.env['FRONT_URL_BIS']}`;

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: [FRONT_URL, FRONT_URL_BIS],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly channelsService: ChannelsService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log('A client has connected to the chat');

    client.on('newConnection', async (user: User) => {
      if (user) {
        await this.channelsService.getNotifications(user.id).then((res) => {
          if (res) {
            client.emit('chatNotifications');
          }
        });
      }
    });

    client.on('get-notifications', async (userId: number) => {
      if (userId) {
        await this.channelsService.getNotifications(userId).then((res) => {
          if (res) {
            client.emit('chatNotifications');
          }
        });
      }
    });

    client.on('chatOff', () => {
      client.emit('chatOff');
    });

    client.on('chat-message-on', async (data: Messages) => {
      if (data) {
        client.emit('chat-message-on', data);
      }
    });

    client.on('chat-message-off', async (data: Messages, user: User) => {
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

    client.on(
      'chat-message',
      async (message: Messages, onlineUsers: User[]) => {
        if (message && onlineUsers) {
          client.broadcast.emit('chat-message', message);
          await this.channelsService
            .notifyOfflineUsers(message, onlineUsers)
            .catch((err) => {
              console.log('Caught error:', err);
            });
        }
      },
    );

    client.on(
      'chat-action',
      async (action: string, userId: number, chanName: string) => {
        client.broadcast.emit('chat-action', action, userId, chanName);
      },
    );

    client.on('chat-action-del', async (message: string, members: number[]) => {
      client.broadcast.emit('chat-action-del', message, members);
    });

    // client.on('app-get-default', () => {
    //   client.emit('get-default');
    // });

    client.on('profile-dm', (recipient: User) => {
      if (recipient) {
        client.emit('app-dm', recipient);
      }
    });

    client.on('userlist-dm', (recipient: User) => {
      if (recipient) {
        client.emit('app-dm', recipient);
      }
    });

    client.on('ready', () => {
      client.emit('ready');
    });

    client.on('init-direct-message', (recipient: User) => {
      if (recipient) {
        client.emit('create-direct-message', recipient);
      }
    });
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('A client has disconnected');
    client.disconnect();
  }

  @SubscribeMessage('createChannel')
  handleCreateChannel(@ConnectedSocket() client: Socket, @MessageBody() info) {
    client.emit('created-channel', info);
    client.broadcast.emit('update-channels', info);
  }

  @SubscribeMessage('update-channels')
  handleUpdateChannels(@ConnectedSocket() client: Socket, @MessageBody() info) {
    client.broadcast.emit('update-channels', info);
  }

  @SubscribeMessage('self-update-channels')
  handleSelfUpdateChannels(
    @ConnectedSocket() client: Socket,
    @MessageBody() info,
  ) {
    client.emit('update-channels', info);
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, channel: string) {
    client.join(channel);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, channel: string) {
    client.leave(channel);
  }

  @SubscribeMessage('bannedUser')
  handleBannedUser(client: Socket, user: User) {
    client.broadcast.emit('bannedUser', user);
  }

  @SubscribeMessage('deletedUser')
  handleDeletedUser(client: Socket, user: User) {
    client.broadcast.emit('deletedUser', user);
  }

  @SubscribeMessage('finishDeletion')
  handleFinishDeletion(client: Socket, user: User, reqId) {
    client.broadcast.emit('finishDeletion', user, reqId);
  }

  @SubscribeMessage('demotedUser')
  handleDemotedUser(client: Socket, user: User) {
    client.broadcast.emit('demotedUser', user);
  }

  @SubscribeMessage('promotedUser')
  handlePromotedUser(client: Socket, user: User) {
    client.broadcast.emit('promotedUser', user);
  }

  @SubscribeMessage('newFriendshipRequest')
  handleNewFriendshipRequest(
    client: Socket,
    relationship: Relationship,
    requester: string,
  ) {
    client.broadcast.emit('newFriendshipRequest', relationship, requester);
  }

  @SubscribeMessage('newBlocked')
  handleNewBlocked(
    client: Socket,
    relationship: Relationship,
    requester: string,
  ) {
    client.broadcast.emit('newBlocked', relationship, requester);
  }

  @SubscribeMessage('removeBlocked')
  handleRemoveBlocked(client: Socket, requester: User, adresseeId: number) {
    client.broadcast.emit('removeBlocked', requester, adresseeId);
  }

  @SubscribeMessage('acceptFriendship')
  acceptFriendship(
    client: Socket,
    user1Id: number,
    user1Name: string,
    user2Id: number,
    user2Name: string,
  ) {
    client.broadcast.emit(
      'friendshipAccepted',
      user1Id,
      user1Name,
      user2Id,
      user2Name,
    );
    client.emit('updateFriendshipList', user1Id);
  }

  @SubscribeMessage('app-updateFriendship')
  updateFriendship(client: Socket, friendId: number) {
    client.emit('updateFriendship', friendId);
    client.emit('updateFriendshipList', friendId);
  }

  @SubscribeMessage('removeFriendship')
  removeFriendship(client: Socket, user1Id: number, user2Id: number) {
    client.broadcast.emit('removeFriendship', user1Id, user2Id);
  }

  @SubscribeMessage('app-addFriendship')
  handleAddFriendship(client: Socket, relationship: Relationship) {
    client.emit('addFriendship', relationship);
  }

  @SubscribeMessage('app-rmFriendship')
  handleRmFriendship(client: Socket, friendId: number) {
    client.emit('rmFriendship', friendId);
    client.emit('rmFromFriendshipList', friendId);
  }

  @SubscribeMessage('isAlreadyConnected')
  handleIsAlreadyConnected(client: Socket, user: User) {
    client.broadcast.emit('isAlreadyConnected', user);
  }

  @SubscribeMessage('leave')
  async onLeave(
    @MessageBody() user: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(user, ' left');
    client.broadcast.emit('leave', user);
  }
}
