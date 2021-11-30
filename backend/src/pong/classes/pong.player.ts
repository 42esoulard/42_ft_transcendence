import { Socket } from 'socket.io';

export class player {
  constructor(
    public userId: number,
    public userName: string,
    public clientSocket: Socket,
    public playerNum: number,
  ) {}
  position: number = 0;
  score: number = 0;
  racquetLenght: number = 0;
  isEnlarged: boolean = false;
  numberOfEnlarge: number = 0;
}
