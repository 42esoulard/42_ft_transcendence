import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

var position: {
  x: 200,
  y: 200
}

@WebSocketGateway()
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  
  private logger: Logger = new Logger('PongGateway');

	private position = {
				x: 200,
				y: 200
  }

  afterInit(server: Server) {
    this.logger.log('init')
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log('Client disconected ' + client.id);
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected ' + client.id);
    client.emit('position', this.position)
  }

  @SubscribeMessage('move')
  handleMessage(client: Socket, text: string): void {
    this.logger.log('msg received: ' + text)
    if (text === 'right')
      this.position.x += 5
    if (text === 'left')
      this.position.x -= 5
    if (text === 'up')
      this.position.y -= 5
    if (text === 'down')
      this.position.y += 5
    this.server.emit('position', this.position);
  }
}
