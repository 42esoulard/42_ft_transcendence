import { JwtService } from '@nestjs/jwt';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { User } from 'src/users/interfaces/user.interface';

type ConnectedUser = {
	id: number,
	username: string,
	count?: number
}

@WebSocketGateway({
	namespace: '/presence',
	cors: {
		origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
		credentials: true,
	},
})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

	// constructor(
	// 	private readonly jwtService: JwtService,
	// ) { }

	@WebSocketServer()
	server: Server;

	users: ConnectedUser[] = [];
	currentUser: ConnectedUser = null;


	// @UseGuards(JwtTwoFactorGuard)
	// @SubscribeMessage('connection')
	// async handleEvent(@MessageBody() user: User, @ConnectedSocket() client: Socket) {
	//     console.log('NEW APP CONNECTION', user);
	//     client.emit('newUser', user); // -->this works, why !?
	// }
	parseCookie(cookie: string): string {
		let str = decodeURIComponent(cookie);
		let split = [];

		str = str.substr(26);
		split = str.split("\",");
		return split[0];
	}

	async handleConnection(client: Socket, ...args: any[]) {

		if (this.users.length != 0) {
			client.emit('allConnectedUsers', this.users as User[]);
		}
		// console.log('NEW APP CONNECTION w/o login');
		// console.log(client.handshake.query)
		// console.log("HEADERS", client.request.headers.cookie);
		if (client.request.headers.cookie) {
			const token = this.parseCookie(client.request.headers.cookie);
			// const user: User = await this.jwtService.verify(
			// 	token
			// );
		}
		client.on('newConnection', (newUser: User) => {
			console.log('NEW APP CONNECTION', newUser.username);
			let user = this.users.find(u => u.id === newUser.id);
			const { id, username } = newUser;
			this.currentUser = { id, username, count: 1 };

			if (user) {
				user.count++;
			}
			else {
				this.users.push(this.currentUser);
				client.broadcast.emit('newUser', newUser);
				console.log("NEW USER", this.currentUser);
				console.log("ALL USERS", this.users);
			}
		})

		client.on('closeConnection', () => {
			if (this.currentUser) {
				this.users = this.users.filter(u => u.id !== this.currentUser.id)
				client.broadcast.emit('outUser', this.currentUser.id);
				this.currentUser = null;
				console.log("REMOVED USER", this.currentUser);
				console.log("ALL USERS", this.users);
			}
		})
		
		// console.log('User connected');
		// console.log('CLIENT', client.client);
	}

	handleDisconnect(client: Socket) {
		console.log('User disconnected');
		if (this.currentUser) {
			if (this.currentUser.count > 1) {
				this.currentUser.count--;
			}
			else {
				this.users = this.users.filter(u => u.id !== this.currentUser.id)
				client.broadcast.emit('outUser', this.currentUser.id);
				this.currentUser = null;
				console.log("QUIT USER", this.currentUser);
				console.log("ALL USERS", this.users);
			}
		}
	}

	afterInit(server: Server) {
		console.log('Socket is live')
	}
}
