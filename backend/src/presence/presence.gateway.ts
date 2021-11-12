// import { JwtService } from '@nestjs/jwt';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, ConnectedSocket } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { User } from 'src/users/interfaces/user.interface';

type ConnectedUser = {
	id: number,
	username: string,
	socket_ids?: string[]
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


	/* Finction Not Used anymore, should we use cookie ?
	 ** I hate cookie ! (except those w chocolate)
	 */
	// parseCookie(cookie: string): string {
	// 	let str = decodeURIComponent(cookie);
	// 	let split = [];

	// 	str = str.substr(26);
	// 	split = str.split("\",");
	// 	return split[0];
	// }

	async handleConnection(client: Socket, ...args: any[]) {
		// console.log("CONNEXION", client.id);

		if (this.users.length != 0) {
			client.emit('allConnectedUsers', this.users as User[]);
			// console.log("ALL USERS", this.users);
		}

		client.on('newConnection', (newUser: User) => {
			// console.log('NEW APP CONNECTION', newUser.username);
			const currentUser: ConnectedUser = { id: newUser.id, username: newUser.username, socket_ids: [] };
			currentUser.socket_ids.push(client.id);

			let user = this.users.find(u => u.id === newUser.id);
			if (user) {
				user.socket_ids.push(client.id);
			}
			else {
				this.users.push(currentUser);
				client.broadcast.emit('newUser', newUser);
				client.emit('newUser', newUser); // for the user himself...
			}
			// console.log("ALL USERS", this.users);
		})

		client.on('closeConnection', (leftUser: User) => {

			let user = this.users.find(u => u.id === leftUser.id);
			if (user) {
				this.users = this.users.filter(u => u.id !== user.id)
				client.broadcast.emit('leftUser', user.id);
				// console.log("REMOVED USER", user);
				// console.log("ALL USERS", this.users);
			}
		})
	}

	async handleDisconnect(client: Socket) {
		// console.log("DISCONNECT", client.id);

		let user = this.users.find(u => u.socket_ids.find(s => s === client.id));
		if (user) {
			user.socket_ids = user.socket_ids.filter(s => s !== client.id)
			if (user.socket_ids.length == 0) {
				this.users = this.users.filter(u => u.id !== user.id)
				client.broadcast.emit('leftUser', user.id);
				// console.log("LEFT USER", user);
			}
		}
		// console.log("ALL USERS", this.users);
	}

	// async handleDisconnect(client: Socket) {
	// 	console.log("DISCONNECT", client.id);
	// 	if (client.request.headers.cookie) {
	// 		const token = this.parseCookie(client.request.headers.cookie);
	// 		console.log("TOKEN", token);
	// 		try {
	// 			const tokenUser = await this.jwtService.verify(
	// 				token, { secret: process.env.JWT_SECRET }
	// 			);
	// 			console.log('USER from Token', tokenUser);

	// 			let user = this.users.find(u => u.id === tokenUser.sub);
	// 			if (user) {
	// 				if (user.count > 1) {
	// 					user.count--;
	// 				}
	// 				else {
	// 					this.users = this.users.filter(u => u.id !== user.id)
	// 					client.broadcast.emit('leftUser', user.id);
	// 					console.log("LEFT USER", user);
	// 				}
	// 				console.log("ALL USERS", this.users);
	// 			}
	// 		} catch (error) {
	// 			console.log(error.message);
	// 		}
	// 	}
	// }

	afterInit(server: Server) {
		console.log('Socket is live')
	}
}
