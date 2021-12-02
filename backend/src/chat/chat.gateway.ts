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
import { User } from 'src/users/interfaces/user.interface';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
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
          .catch((err) =>
            console.log('Caught error:', err),
          );
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
            }
            );
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

  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, channel: string) {
    client.join(channel);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, channel: string) {
    client.leave(channel);
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
