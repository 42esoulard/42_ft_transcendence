import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/channels/channels.service';
import { Relationship } from 'src/relationships/interfaces/relationship.interface';
import { User } from 'src/users/interfaces/user.interface';
export declare class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly channelsService;
  constructor(channelsService: ChannelsService);
  server: Server;
  handleConnection(client: Socket): Promise<void>;
  handleDisconnect(client: Socket): Promise<void>;
  handleCreateChannel(client: Socket, info: any): void;
  handleUpdateChannels(client: Socket, info: any): void;
  handleSelfUpdateChannels(client: Socket, info: any): void;
  handleJoinChannel(client: Socket, channel: string): void;
  handleLeaveChannel(client: Socket, channel: string): void;
  handleBannedUser(client: Socket, user: User): void;
  handleDeletedUser(client: Socket, user: User): void;
  handleFinishDeletion(client: Socket, user: User, reqId: any): void;
  handleDemotedUser(client: Socket, user: User): void;
  handlePromotedUser(client: Socket, user: User): void;
  handleNewFriendshipRequest(
    client: Socket,
    relationship: Relationship,
    requester: string,
  ): void;
  handleNewBlocked(
    client: Socket,
    relationship: Relationship,
    requester: string,
  ): void;
  handleRemoveBlocked(
    client: Socket,
    requester: User,
    adresseeId: number,
  ): void;
  acceptFriendship(
    client: Socket,
    user1Id: number,
    user1Name: string,
    user2Id: number,
    user2Name: string,
  ): void;
  updateFriendship(client: Socket, friendId: number): void;
  removeFriendship(client: Socket, user1Id: number, user2Id: number): void;
  handleAddFriendship(client: Socket, relationship: Relationship): void;
  handleRmFriendship(client: Socket, friendId: number): void;
  handleIsAlreadyConnected(client: Socket, user: User): void;
  onLeave(user: string, client: Socket): Promise<void>;
}
