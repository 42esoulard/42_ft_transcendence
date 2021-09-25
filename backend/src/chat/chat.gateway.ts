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
  cors: {
    origin: ["http://localhost:8080", "http://127.0.0.1:8080"],
    credentials: true,
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  connections: number = 0;

  async handleConnection() {
    // A client has connected
    this.connections++;
    // console.log("A client has connected");
    
    // Notify connected clients of current users
    this.server.emit('connections', this.connections);
  }
  
  async handleDisconnect() {
    // A client has disconnected
    this.connections--;
    // console.log("A client has disconnected");
    // Notify connected clients of current users
    this.server.emit('connections', this.connections);
  }

  @SubscribeMessage('chat-message')
  async onChat(@MessageBody() message: string, @ConnectedSocket() client: Socket) {
    // client.emit('chat-message', message, (message) => console.log(message));
    client.broadcast.emit('chat-message', message);
  }
  
  @SubscribeMessage('typing')
  async onTyping(@MessageBody() TypingUser: string, @ConnectedSocket() client: Socket) {
    client.broadcast.emit("typing", TypingUser);
    console.log(TypingUser);
  }
  
  @SubscribeMessage('stopTyping')
  async onStopTyping(@ConnectedSocket() client: Socket) {
    client.broadcast.emit("stopTyping");
  }
  
  @SubscribeMessage('join')
  async onJoin(@MessageBody() user: string, @ConnectedSocket() client: Socket) {
    console.log(user, ' joined');
    client.broadcast.emit("join", user);
  }
  
  @SubscribeMessage('leave')
  async onLeave(@MessageBody() user: string, @ConnectedSocket() client: Socket) {
    console.log(user, ' left');
    client.broadcast.emit("leave", user);
  }
}