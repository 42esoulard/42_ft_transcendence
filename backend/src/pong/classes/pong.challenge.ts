import { Socket } from 'socket.io';
import { gameMode } from './pong.types';

export class challenge {
  constructor(
	public challengerId : number, 
	public challengerName: string, 
	public challengeeId : number, 
	public challengeeName: string, 
	public gameMode: gameMode) {
	}
	challengerSocket: Socket
	challengeeSocket: Socket
}
