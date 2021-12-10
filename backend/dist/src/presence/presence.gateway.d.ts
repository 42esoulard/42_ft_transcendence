import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
export declare class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  server: Server;
  private connectedUsers;
  handleConnection(client: Socket, ...args: any[]): Promise<void>;
  handleDisconnect(client: Socket): Promise<void>;
  afterInit(server: Server): void;
}
