import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelsService } from 'src/channels/channels.service';
import { User } from 'src/users/interfaces/user.interface';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly channelsService;
    constructor(channelsService: ChannelsService);
    server: Server;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleCreateChannel(client: Socket, info: any): void;
    handleUpdateChannels(client: Socket, info: any): void;
    handleJoinChannel(client: Socket, channel: string): void;
    handleLeaveChannel(client: Socket, channel: string): void;
    handleBannedUser(client: Socket, user: User): void;
    handleDeletedUser(client: Socket, user: User): void;
    handleSelfDeletedUser(client: Socket, user: User): void;
    handleDemotedUser(client: Socket, user: User): void;
    handlePromotedUser(client: Socket, user: User): void;
    handleNewFriendshipRequest(client: Socket, adressee: User): void;
    handleIsAlreadyConnected(client: Socket, user: User): void;
    onLeave(user: string, client: Socket): Promise<void>;
}
