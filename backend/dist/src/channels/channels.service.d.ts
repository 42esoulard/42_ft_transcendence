import { Channel } from './interfaces/channel.interface';
import { DeleteResult, Repository } from 'typeorm';
import { Channels } from './entity/channels.entity';
import { CreateChannelDto } from './dto/createChannel.dto';
import { UsersService } from '../users/users.module';
import { Users } from 'src/users/entity/users.entity';
import { ChannelMembersService } from 'src/channel_members/channel_members.service';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';
import { RelationshipsService } from 'src/relationships/relationships.service';
import { Messages } from 'src/messages/entity/messages.entity';
import { User } from 'src/users/interfaces/user.interface';
export declare class ChannelsService {
  private readonly channelsRepository;
  private readonly userService;
  private readonly channelMemberService;
  private readonly relationshipService;
  constructor(
    channelsRepository: Repository<Channels>,
    userService: UsersService,
    channelMemberService: ChannelMembersService,
    relationshipService: RelationshipsService,
  );
  seed(): Promise<Channel>;
  getChannels(): Promise<Channels[]>;
  getChannelByName(name: string): Promise<Channel>;
  getChannelsByName(name: string): Promise<Channel[]>;
  getUser(user_id: number): Promise<Users>;
  getNotifications(userId: number): Promise<boolean>;
  getNewNotification(data: Messages, userId: number): Promise<boolean>;
  getChannelMember(channel_id: number, user_id: number): Promise<ChannelMember>;
  setNewMessage(status: boolean, cmId: number): Promise<ChannelMember>;
  toggleNotification(cm: ChannelMember): Promise<ChannelMember>;
  notifyOfflineUsers(message: Messages, onlineUsers: User[]): Promise<void>;
  getCmById(cm_id: number): Promise<ChannelMember>;
  checkBlocked(user_id: number, blocked_id: number): Promise<boolean>;
  filterBanned(userChannels: ChannelMember[]): Promise<ChannelMember[]>;
  filterBlocked(
    user: Users,
    userChannels: ChannelMember[],
  ): Promise<ChannelMember[]>;
  filterBlockedInAvail(userId: number, channels: Channel[]): Promise<Channel[]>;
  getUserChannels(user_id: number): Promise<ChannelMember[]>;
  getAvailableChannels(user_id: number): Promise<Channel[]>;
  getChannelById(chanId: number, userId: number): Promise<Channels>;
  getChannelPreview(chanId: number, userId: number): Promise<Channel>;
  checkPasswordMatch(
    channel_id: number,
    user_id: number,
    attempt: string,
  ): Promise<boolean>;
  joinChannel(channel_id: number, user_id: number): Promise<ChannelMember>;
  leaveChannel(cm_id: number): Promise<DeleteResult>;
  deleteChannel(chan_id: number): Promise<DeleteResult>;
  saveDmChannel(dmInfo: CreateChannelDto): Promise<ChannelMember>;
  saveChannel(channelDto: CreateChannelDto): Promise<ChannelMember>;
  muteBanMember(
    action: string,
    cm_id: number,
    end_date: number,
  ): Promise<ChannelMember>;
  toggleAdmin(cm_id: number): Promise<ChannelMember>;
  updateChannelPassword(
    chan_id: number,
    user_id: number,
    pwd: string,
  ): Promise<Channel>;
}
