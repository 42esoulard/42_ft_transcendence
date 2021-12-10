import { DeleteResult, Repository } from 'typeorm';
import { ChannelMembers } from './entity/channel_members.entity';
import { Users } from 'src/users/entity/users.entity';
import { Channels } from 'src/channels/entity/channels.entity';
import { ChannelMember } from './interfaces/channel_member.interface';
export declare class ChannelMembersService {
  private readonly channelMembersRepository;
  constructor(channelMembersRepository: Repository<ChannelMembers>);
  getUserChannels(user: Users): Promise<ChannelMembers[]>;
  getChannelMember(channel: Channels, user: Users): Promise<ChannelMembers>;
  getChannelMemberById(cm_id: number): Promise<ChannelMembers>;
  createChannelMember(
    channel: Channels,
    user: Users,
    is_owner?: boolean,
    is_admin?: boolean,
    notification?: boolean,
  ): Promise<ChannelMembers>;
  deleteChannelMember(cm_id: number): Promise<DeleteResult>;
  toggleAdmin(cm_id: number): Promise<ChannelMembers>;
  muteBanMember(
    action: string,
    cm_id: number,
    end_date: number,
  ): Promise<ChannelMembers>;
  checkMute(cm: ChannelMembers): boolean;
  checkBan(cm: ChannelMembers): boolean;
  setNewMessage(status: boolean, cmId: number): Promise<ChannelMember>;
  toggleNotification(cmId: number): Promise<ChannelMember>;
}
