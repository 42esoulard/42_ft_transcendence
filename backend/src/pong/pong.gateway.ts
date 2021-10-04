import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsResponse, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

var BALL_SPEED = 1
var INTERVAL_IN_MS = 20
var CANVAS_WIDTH = 640
var CANVAS_HEIGHT = 480
var BALL_INITIAL_DIR_X = -2
var BALL_INITIAL_DIR_Y = -1
var BALL_RADIUS = 10
var RAQUET_LENGTH = 80


@WebSocketGateway( { namespace: '/pong'})
export class PongGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  
  private logger: Logger = new Logger('PongGateway');

	private position = {
				player1: 200,
				player2: 200,
        ball: {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2
        },
  }

  private ballDirection = {
    x: BALL_INITIAL_DIR_X,
    y: BALL_INITIAL_DIR_Y
  }

  private clients = {
        client1: '',
        client2: ''
  }

  private interval = null
  
  afterInit(server: Server) {
    this.logger.log('Initialized')
  }
  
  handleDisconnect(client: Socket) {
    if (client.id === this.clients.client1)
      this.clients.client1 = ''
    if (client.id === this.clients.client2)
      this.clients.client2 = ''

    this.logger.log('Client disconected ' + client.id);
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('Client connected ' + client.id);
    client.emit('position', this.position)
  }

  @SubscribeMessage('move')
  handleMessage(client: Socket, message: {room: string, text: string}): void {
    // this.logger.log('msg received: ' + message.text)
    if (client.id === this.clients.client1)
    {
      if (message.text === 'up')
        this.position.player1 -= 5
      if (message.text === 'down')
        this.position.player1 += 5
    }
    if (client.id === this.clients.client2)
    {
      if (message.text === 'up')
        this.position.player2 -= 5
      if (message.text === 'down')
        this.position.player2 += 5

    }
    this.server.to(message.room).emit('position', this.position);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room:string)
  {
    if (this.clients.client1 && this.clients.client2)
    {
      this.logger.log('room is full')
      client.emit('roomIsFull')
      return
    }
    client.join(room)
    if (!this.clients.client1)
      this.clients.client1 = client.id
    else if (!this.clients.client2)
      this.clients.client2 = client.id
    client.emit('joinedRoom', room)
    client.to(room).emit('opponentJoinedRoom')

    this.interval = setInterval(() => {
      this.moveBall(client, room)
    }, INTERVAL_IN_MS)
  }
  
  moveBall(client: Socket, room:string) {
    // change direction if needed

    // if touches wall
    // up or down
    if (this.position.ball.y <= BALL_RADIUS || this.position.ball.y >= CANVAS_HEIGHT - BALL_RADIUS)
    {
      this.ballDirection.y = -this.ballDirection.y
    }
    // left
    if (this.position.ball.x <= BALL_RADIUS)
    {
      if (this.position.ball.y >= this.position.player1 && this.position.ball.y <= (this.position.player1 + RAQUET_LENGTH))
        this.ballDirection.x = -this.ballDirection.x
      else
      {
        this.ballDirection.x = 0,
        this.ballDirection.y = 0
      }
    }
    // right

    if (this.position.ball.x >= CANVAS_WIDTH - BALL_RADIUS)
    {
      if (this.position.ball.y >= this.position.player2 && this.position.ball.y <= (this.position.player2 + RAQUET_LENGTH))
        this.ballDirection.x = -this.ballDirection.x
      else
      {
        this.ballDirection.x = 0,
        this.ballDirection.y = 0
      }
    }


    // move ball in direction
    this.position.ball.x += this.ballDirection.x * BALL_SPEED
    this.position.ball.y += this.ballDirection.y * BALL_SPEED
    client.emit('position', this.position)
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room:string)
  {
    if (client.id === this.clients.client1)
      this.clients.client1 = ''
    if (client.id === this.clients.client2)
      this.clients.client2 = ''
    client.to(room).emit('opponentLeftRoom')
    client.leave(room)
  }
}
