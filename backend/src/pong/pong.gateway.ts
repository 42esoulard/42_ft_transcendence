import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Repository } from 'typeorm';
import { Game } from './entity/games.entity';
import { GameUser } from './entity/gameUser.entity';
import { pongGame } from './classes/pong.pongGame';
import { player } from './classes/pong.player';


@WebSocketGateway( { namespace: '/pong'})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(GameUser)
    private readonly gameUserRepo: Repository<GameUser>
  ) {}

  @WebSocketServer()
  server: Server;
  
  private logger: Logger = new Logger('PongGateway');

  private games = new Map() // pongGame map. key = room id
  private waitingPlayer: player = null
  
  
  afterInit(server: Server): void {
    this.logger.log('Initialized')
  }
  
  handleDisconnect(client: Socket): void {
    this.logger.log('Client disconected ' + client.id);
    this.clearQueue(client)
    // if (this.waitingPlayer && this.waitingPlayer.clientSocket == client)
    // {
    //   delete this.waitingPlayer
    //   this.waitingPlayer = null
    // }
    this.games.forEach((value: pongGame, key: string) => {
      if (value.player1.clientSocket.id === client.id || value.player2.clientSocket.id === client.id)
        this.leaveGame(client, key)
    })
  }
  
  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.log('Client connected ' + client.id);
  }

  @SubscribeMessage('joinGame')
  async handleJoinGameMessage(client: Socket, message: {userId: number, userName: string}): Promise<void>
  {
    this.logger.log('client joined game. userId: ' + message.userName)
    if (!this.waitingPlayer)
    {
      this.waitingPlayer = new player(message.userId, message.userName, client)
      client.emit('waitingForOpponent')
    }
    else
    {
      const player2 = new player(message.userId, message.userName, client)
      const game = new pongGame(this.waitingPlayer, player2, this.gameRepo, this.gameUserRepo, this.server)
      await game.createGame()
      this.games.set(game.room, game)
    }
  }

  @SubscribeMessage('leaveQueue')
  handleLeaveQueue(client: Socket, room:string): void
  {
    this.clearQueue(client)
  }

  
  @SubscribeMessage('leaveGame')
  handleLeaveGame(client: Socket, room:string): void
  {
    this.leaveGame(client, room)
      // client.to(room).emit('opponentLeftRoom')
      // client.leave(room)
  }


  @SubscribeMessage('moveRacquet')
  handleMoveRacquet(client: Socket, message: {room: string, text: string}): void {

    // this.logger.log('msg received: ' + message.room)
    const game: pongGame = this.games.get(message.room)
    if (!game)
    {
      this.logger.error('moveRacquet: game doesnt exist')
      return
    }
    game.moveRacquet(client.id, message.text)
  }

  async leaveGame(clientWhoLeft: Socket, room: string)
  {
    const game: pongGame = this.games.get(room)
    if (!game)
    {
      this.logger.error('endGame: game doesnt exist')
      return
    }

    const player1Won: boolean = clientWhoLeft === game.player2.clientSocket
    await game.endGame(player1Won)
    this.games.delete(room)
  }

  clearQueue(client: Socket)
  {
    if (this.waitingPlayer && this.waitingPlayer.clientSocket == client)
    {
      this.logger.log('deleting queue')
      delete this.waitingPlayer
      this.waitingPlayer = null
    }
  }
  
}
