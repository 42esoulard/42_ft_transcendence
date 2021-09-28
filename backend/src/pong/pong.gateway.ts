import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

var position: {
  x: 200,
  y: 200
}

@WebSocketGateway( { namespace: '/pong'})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  
  private logger: Logger = new Logger('PongGateway');

	private position = {
				player1: 200,
				player2: 200
  }

  private clients = {
        client1: '',
        client2: ''
  }

  afterInit(server: Server) {
    this.logger.log('Initialized')
  }
  
  handleDisconnect(client: Socket) {
    if (client.id === this.clients.client1)
      this.clients.client1 = ''
    if (client.id === this.clients.client2)
      this.clients.client2 = ''

    this.logger.log('Client disconected ' + client.id);
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected ' + client.id);
    client.emit('position', this.position)
  }

  @SubscribeMessage('move')
  handleMessage(client: Socket, message: {room: string, text: string}): void {
    this.logger.log('msg received: ' + message.text)
    if (client.id === this.clients.client1)
    {
      if (message.text === 'up')
        this.position.player1 -= 5
      if (message.text === 'down')
        this.position.player1 += 5
    }
    if (client.id === this.clients.client2)
    {
      if (message.text === 'up')
        this.position.player2 -= 5
      if (message.text === 'down')
        this.position.player2 += 5
    }
    this.server.to(message.room).emit('position', this.position);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room:string)
  {
    if (this.clients.client1 && this.clients.client2)
    {
      this.logger.log('room is full')
      client.emit('roomIsFull')
      return
    }
    client.join(room)
    if (!this.clients.client1)
      this.clients.client1 = client.id
    else if (!this.clients.client2)
      this.clients.client2 = client.id
    client.emit('joinedRoom', room)
    client.to(room).emit('opponentJoinedRoom')
  }
  
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room:string)
  {
    if (client.id === this.clients.client1)
      this.clients.client1 = ''
    if (client.id === this.clients.client2)
      this.clients.client2 = ''
    client.to(room).emit('opponentLeftRoom')
    client.leave(room)
  }
}
