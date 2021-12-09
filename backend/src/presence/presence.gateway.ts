import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { User } from 'src/users/interfaces/user.interface';

type ConnectedUser = {
  id: number;
  username: string;
  socket_ids?: string[];
};

const FRONT_URL = `${process.env['FRONT_URL']}`;
const FRONT_URL_BIS = `${process.env['FRONT_URL_BIS']}`;

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: [FRONT_URL, FRONT_URL_BIS],
    credentials: true,
  },
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: ConnectedUser[] = [];

  async handleConnection(client: Socket, ...args: any[]) {
    if (this.connectedUsers.length != 0) {
      client.emit('allConnectedUsers', this.connectedUsers as User[]);
    }

    client.on('newConnection', (newUser: User) => {
      const currentUser: ConnectedUser = {
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
        client.emit('newUser', newUser); // for the user himself...
      }
    });

    client.on('closeConnection', (leftUser: User) => {
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

  async handleDisconnect(client: Socket) {
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

  afterInit(server: Server) {}
}
