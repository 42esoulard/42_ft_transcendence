import { UseGuards } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JwtTwoFactorGuard } from 'src/auth/guards/jwtTwoFactor.guard';
import { User } from 'src/users/interfaces/user.interface';


@WebSocketGateway({
    namespace: '/presence',
    cors: {
        origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
        credentials: true,
    },
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

    @WebSocketServer()
    server: Server;

    // @UseGuards(JwtTwoFactorGuard)
    @SubscribeMessage('connection')
    async handleEvent(@MessageBody() user: User, @ConnectedSocket() client: Socket) {
        console.log('NEW APP CONNECTION', user);
        // client.broadcast.emit("newUser", user); // doesn't work
        this.server.emit('newUser', user); // -->this works, why !?
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log('User connected');
        // console.log('CLIENT', client.client);
    }

    handleDisconnect(client: Socket) {
        console.log('User disconnected');
    }

    afterInit(server: Server) {
        console.log('Socket is live')
    }
}
