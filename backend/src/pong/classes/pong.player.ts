import { Socket } from 'socket.io';

export class player {
  constructor(
	public userId: number, 
	public userName: string, 
	public clientSocket: Socket,
	public playerNum: number) {
		this.userId = userId,
		this.clientSocket = clientSocket
  }
  position: number = 0
  score: number = 0
	racquetLenght: number = 0
}
