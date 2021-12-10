import { Socket } from 'socket.io';
import { gameMode } from './pong.types';
export declare class challenge {
  challengerId: number;
  challengerName: string;
  challengeeId: number;
  challengeeName: string;
  expiry_date: Date;
  gameMode: gameMode;
  constructor(
    challengerId: number,
    challengerName: string,
    challengeeId: number,
    challengeeName: string,
    expiry_date: Date,
    gameMode: gameMode,
  );
  challengerSocket: Socket;
}
