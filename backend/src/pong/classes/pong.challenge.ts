import { Socket } from 'socket.io';
import { gameMode } from './pong.types';

export class challenge {
  constructor(
	private challengerId : number, 
	private challengerName: string, 
	private challengeeId : number, 
	private challengeeName: string, 
	private gameMode: gameMode) {
	}
	challengerSocket: Socket
	challengeeSocket: Socket
}
