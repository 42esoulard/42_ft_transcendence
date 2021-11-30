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

@WebSocketGateway({
  namespace: '/presence',
  cors: {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
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
    // console.log("CONNEXION", client.id);
    // console.log("ALL USERS", this.connectedUsers);

    if (this.connectedUsers.length != 0) {
      client.emit('allConnectedUsers', this.connectedUsers as User[]);
    }

    client.on('newConnection', (newUser: User) => {
      // console.log('NEW APP CONNECTION', newUser.username);
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
      // console.log("ALL USERS", this.connectedUsers);
    });

    client.on('closeConnection', (leftUser: User) => {
      let user = this.connectedUsers.find((u) => u.id === leftUser.id);
      if (user) {
        this.connectedUsers = this.connectedUsers.filter(
          (u) => u.id !== user.id,
        );
        client.broadcast.emit('leftUser', user.id);
        // console.log("REMOVED USER", user);
        // console.log("ALL USERS", this.connectedUsers);
      }
    });
  }

  async handleDisconnect(client: Socket) {
    // console.log("DISCONNECT", client.id);

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
        // console.log("LEFT USER", user);
      }
    }
    // console.log("ALL USERS", this.connectedUsers);
  }

  afterInit(server: Server) {
    // console.log('Socket is live')
  }
}
