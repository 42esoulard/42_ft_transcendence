import { ChannelsService } from './channels.service';
import { Channel } from './interfaces/channel.interface';
import { CreateChannelDto } from './dto/createChannel.dto';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';
import { DeleteResult } from 'typeorm';
import { Request } from 'express';
export declare class ChannelsController {
  private readonly channelService;
  constructor(channelService: ChannelsService);
  getChannels(request: Request): Promise<Channel[]>;
  getChannelsNames(request: Request): Promise<string[]>;
  getDefaultChannel(request: Request): Promise<Channel>;
  getChannelById(chanId: number, request: Request): Promise<Channel>;
  getChannelPreview(chanId: number, request: Request): Promise<Channel>;
  getChannelByName(name: string): Promise<boolean>;
  saveChannel(newChannel: CreateChannelDto): Promise<ChannelMember>;
  saveDmChannel(newChannel: CreateChannelDto): Promise<ChannelMember>;
  setNewMessage(
    status: string,
    chanId: number,
    request: Request,
  ): Promise<ChannelMember>;
  toggleNotification(cmId: number, request: Request): Promise<ChannelMember>;
  joinChannel(
    type: string,
    channel_id: number,
    user_id: number,
    request: Request,
  ): Promise<ChannelMember>;
  checkPasswordMatch(
    channel_id: number,
    attempt: string,
    request: Request,
  ): Promise<boolean>;
  getUserChannels(request: Request): Promise<ChannelMember[]>;
  getAvailableChannels(request: Request): Promise<Channel[]>;
  getChannelMember(channel_id: number, user_id: number): Promise<ChannelMember>;
  leaveChannel(
    type: string,
    cm_id: number,
    request: Request,
  ): Promise<DeleteResult>;
  deleteChannel(chan_id: number, request: Request): Promise<DeleteResult>;
  muteBanMember(
    action: string,
    cm_id: number,
    end_date: number,
    request: Request,
  ): Promise<ChannelMember>;
  toggleAdmin(cm_id: number, request: Request): Promise<ChannelMember>;
  updateChannelPassword(
    chan_id: number,
    pwd: string,
    request: Request,
  ): Promise<Channel>;
}
