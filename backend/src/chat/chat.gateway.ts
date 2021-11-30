import { Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/channels/channels.service';
import { Messages } from 'src/messages/entity/messages.entity';
// import { ChannelMembersService } from 'src/channel_members/channel_members.service';
// import { RelationshipsService } from 'src/relationships/relationships.service';
import { User } from 'src/users/interfaces/user.interface';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly channelsService: ChannelsService,
    // private readonly relationshipService: RelationshipsService,
  ){}

  @WebSocketServer()
  server: Server;

  async handleConnection(@ConnectedSocket() client: Socket) {
    console.log('A client has connected to the chat');
    // client.emit('update-notifications');
    // await this.cmRepo.find({where: { new_message: true },})
    // .then((res) => {
    //   client.emit('chat-notifications', res);
    // })
    client.on('newConnection', async (user: User) => {
      await this.channelsService.getNotifications(user.id)
      .then((res) => {
        if (res) {
          console.log("found new notif!")
          client.emit('chatNotifications');
        }
      })
    })

    client.on('chat-message-on', async (data: Messages) => {
      client.emit('chat-message-on', data);
    })

    client.on('chat-message-off', async (data: Messages, user: User) => {
      await this.channelsService.getNewNotification(data, user.id)
      .then((res) => {
        if (res) {
          client.emit('chatNotifications');
        }
      })
      .catch((err) => console.log("Caught error:", err.response.data.message))
    })

    client.on('chat-message', async (message: Messages, onlineUsers: User[]) => {
      client.broadcast.emit('chat-message', message);
      await this.channelsService.notifyOfflineUsers(message, onlineUsers)
      .catch((err) => console.log("Caught error:", err.response.data.message))
    })
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log('A client has disconnected');
    client.disconnect();
  }

  // @SubscribeMessage('chat-message')
  // async onChat(@ConnectedSocket() client: Socket, message: Messages, onlineUsers: User[]) {
  //   client.broadcast.emit('chat-message', message);
  //   await this.channelsService.notifyOfflineUsers(message, onlineUsers);
  // }

  // @SubscribeMessage('chat-message-on')
  // async onChatMessageOn(@ConnectedSocket() client: Socket, @MessageBody() message) {
  //   client.emit('chat-message-on', message);
  // }

  // @SubscribeMessage('chat-message-off')
  // async onChatMessageOff(@ConnectedSocket() client: Socket, @MessageBody() message, user: User) {
  //   // await relApi.getBlockedByUser(user.value.id)
  //   //     .then(async (blocked) => {
  //   //       // console.log("blocked", blocked.data.map((blocked) => blocked.adresseeId));
  //   //       // console.log(data.author.id)
  //   //       if (blocked.data.map((blocked) => blocked.adresseeId).includes(data.author.id)) {
  //   //         return;
  //   //       }
  //   //       if (activeChannel.value!.channel && activeChannel.value!.channel.id === data.channel.id) {
          
  //   //         channelMessages.value.push(data);
  //   //         console.log("in get messages:", channelMessages.value);
  //   //       } else if (activeChannel.value!.channel) {
  //   //         console.log("set newMessage = true here");
  //   //         await api.setNewMessage('true', data.channel.id, { withCredentials: true })
  //   //         .then((res) => { 
  //   //           store.state.chatNotification = true; 
  //   //           console.log(res)
  //   //           updateChannelsList();
  //   //         })
  //   //         .catch((err) => console.log("Caught error:", err.response.data.message));
  //   //       }
  //   //   // getMessagesUpdate(data.channel);
  //   //   });
    
  //   client.emit('chatNotifications', message);
  
  // }

  @SubscribeMessage('createChannel')
  handleCreateChannel(@ConnectedSocket() client: Socket, @MessageBody() info) {
    // User has created a new chatroom
    client.emit('created-channel', info);
    
    //Notify other users of chatroom creation
    client.broadcast.emit('update-channels', info);
  }

  @SubscribeMessage('update-channels')
  handleUpdateChannels(@ConnectedSocket() client: Socket, @MessageBody() info) {
    
    //Notify other users of chatroom creation
    client.broadcast.emit('update-channels', info);
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(client: Socket, channel: string) {
    // User has joined a chatroom
    client.join(channel);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(client: Socket, channel: string) {
    // User has left a chatroom
    client.leave(channel);
  }

  // @SubscribeMessage('join')
  // async onJoin(@MessageBody() user: string, @ConnectedSocket() client: Socket) {
  //   console.log(user, ' joined');
  //   // User has joined the chat
  //   client.broadcast.emit('join', user, this.connections);
  // }

  @SubscribeMessage('leave')
  async onLeave(
    @MessageBody() user: string,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(user, ' left');
    // User has left the chat
    client.broadcast.emit('leave', user);
  }
}
