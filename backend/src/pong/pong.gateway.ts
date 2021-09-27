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
				x: 200,
				y: 200
  }


  afterInit(server: Server) {
    this.logger.log('Initialized')
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log('Client disconected ' + client.id);
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected ' + client.id);
    client.emit('position', this.position)
  }

  @SubscribeMessage('move')
  handleMessage(client: Socket, message: {room: string, text: string}): void {
    this.logger.log('msg received: ' + message.text)
    if (message.text === 'right')
      this.position.x += 5
    if (message.text === 'left')
      this.position.x -= 5
    if (message.text === 'up')
      this.position.y -= 5
    if (message.text === 'down')
      this.position.y += 5
    this.server.to(message.room).emit('position', this.position);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room:string)
  {
    client.join(room)
    client.emit('joinedRoom', room)
  }
  
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room:string)
  {
    client.leave(room)
    client.emit('leftRoom', room)
  }
}
