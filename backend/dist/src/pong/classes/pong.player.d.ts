import { Socket } from 'socket.io';
export declare class player {
  userId: number;
  userName: string;
  clientSocket: Socket;
  playerNum: number;
  constructor(
    userId: number,
    userName: string,
    clientSocket: Socket,
    playerNum: number,
  );
  position: number;
  score: number;
  racquetLenght: number;
  isEnlarged: boolean;
  numberOfEnlarge: number;
}
