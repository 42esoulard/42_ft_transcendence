import { Socket } from 'socket.io';

export class player {
  constructor(
	public userId: number, 
	public clientSocket: Socket) {
		this.userId = userId,
		this.clientSocket = clientSocket
  }
}