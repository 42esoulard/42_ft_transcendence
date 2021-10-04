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

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  connections = 0;

  async handleConnection() {
    console.log('A client has connected');
    this.connections++;
    // Notify connected clients of current users
    this.server.emit('connections', this.connections);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('A client has disconnected');
    this.connections--;
    client.disconnect();
    // Notify connected clients of current users
    this.server.emit('connections', this.connections);
  }

  @SubscribeMessage('get-connections')
  async getConnections(@ConnectedSocket() client: Socket) {
    client.broadcast.emit('connections', this.connections);
  }

  @SubscribeMessage('chat-message')
  async onChat(@ConnectedSocket() client: Socket, @MessageBody() message) {
    client.broadcast.emit('chat-message', message);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() info) {
    // User has created a new chatroom
    client.emit('createdRoom', info.room);

    //Notify other users of chatroom creation
    client.broadcast.emit('addRoom', info.room);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    // User has joined a chatroom
    client.join(room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    // User has left a chatroom
    client.leave(room);
  }

  @SubscribeMessage('typing')
  async onTyping(
    @MessageBody() TypingUser: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.broadcast.emit('typing', TypingUser);
    // console.log(TypingUser);
  }

  @SubscribeMessage('stopTyping')
  async onStopTyping(@ConnectedSocket() client: Socket) {
    client.broadcast.emit('stopTyping');
  }

  @SubscribeMessage('join')
  async onJoin(@MessageBody() user: string, @ConnectedSocket() client: Socket) {
    console.log(user, ' joined');
    // User has joined the chat
    client.broadcast.emit('join', user, this.connections);
  }

  @SubscribeMessage('leave')
  async onLeave(
    @MessageBody() user: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(user, ' left');
    // User has left the chat
    client.broadcast.emit('leave', user);
  }
}
