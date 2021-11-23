import { Injectable } from '@nestjs/common';
import { Channel } from './interfaces/channel.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Channels } from './entity/channels.entity';
import { CreateChannelDto } from './dto/createChannel.dto';
import { UsersService } from '../users/users.module';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/users/entity/users.entity';
import { ChannelMembersService } from 'src/channel_members/channel_members.service';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';
import { reduce } from 'rxjs';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly channelsRepository: Repository<Channels>,
    private readonly userService: UsersService,
    private readonly channelMemberService: ChannelMembersService,
  ) {}

  async seed(): Promise<Channel> {
    console.log('Initializing default channel...');
    return await this.channelsRepository.save({
      id: 1,
      name: 'General',
      password: null,
      type: 'public',
    });
    // .then(() => console.log('Channels seed complete!'))
    // .catch(() => console.log('Channels seed failed :('));
  }

  /**
   * Lists all channels in database
   * nb: find() is a function from the typeORM library
   */
  async getChannels(): Promise<Channels[]> {
    return await this.channelsRepository.find();
  }

  /**
   * Gets a channel in database by its name
   * nb: findOne(id) is a function from the typeORM library
   */
  async getChannelByName(name: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { name: name },
    });
    return channel;
  }

  async getChannelMember(
    channel_id: number,
    user_id: number,
  ): Promise<ChannelMember> {
    const channel: Channels = await this.getChannelById(channel_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    return await this.channelMemberService.getChannelMember(channel, user);
  }

  // async getChannelMembers(channel_id: number): Promise<ChannelMember> {
  //   const channel: Channels = await this.getChannelById(channel_id);

  //   return await this.channelMemberService.getChannelMembers(channel);
  // }

  // async getChannelMutedMembers(channel_id: number): Promise<ChannelMember> {
  //   const channel: Channels = await this.getChannelById(channel_id);

  //   return await this.channelMemberService.getChannelMutedMembers(channel);
  // }

  // async getChannelBannedMembers(
  //   channel_id: number,
  // ): Promise<ChannelMember> {
  //   const channel: Channels = await this.getChannelById(channel_id);

  //   return await this.channelMemberService.getChannelMutedMembers(channel);
  // }

  async filterBanned(userChannels: ChannelMember[]): Promise<ChannelMember[]> {
    return userChannels.filter((userChannels) => !userChannels.ban);
  }

  async getUserChannels(user_id: number): Promise<ChannelMember[]> {
    const user: Users = await this.userService.getUserbyId(user_id);
    return await this.channelMemberService.getUserChannels(user);
  }

  async getAvailableChannels(user_id: number): Promise<Channel[]> {
    let channels = await this.getChannels();
    return await this.getUserChannels(user_id).then(async (res) => {
      const userChannels = res.map((cm) => cm.channel);
      channels = channels.filter(
        (channels) =>
          !userChannels
            .map((userChannels) => userChannels.id)
            .includes(channels.id),
      );
      channels = channels.filter((channels) => channels.type === 'public');
      channels.forEach((channel) => {
        if (channel.password) {
          channel.messages = [];
        }
      });
      return await channels;
    });
  }

  /**
   * Gets a channel in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getChannelById(id: number): Promise<Channels> {
    console.log('in get channel by id', id);
    return await this.channelsRepository.findOne(id, {
      relations: ['messages', 'channel_members'],
    });
  }

  async checkPasswordMatch(
    channel_id: number,
    attempt: string,
  ): Promise<boolean> {
    const channel: Channels = await this.getChannelById(channel_id);
    const ret = await bcrypt.compare(attempt, channel.password);
    return await ret;
  }

  async joinChannel(
    channel_id: number,
    user_id: number,
  ): Promise<ChannelMember> {
    const channel: Channels = await this.getChannelById(channel_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    const cm = await this.channelMemberService.getChannelMember(channel, user);
    if (cm) {
      console.log('in joinchannel', cm);
      return await cm;
    }
    return await this.channelMemberService.createChannelMember(channel, user);
  }

  async leaveChannel(cm_id: number): Promise<DeleteResult> {
    return await this.channelMemberService.deleteChannelMember(cm_id);
  }

  async deleteChannel(chan_id: number): Promise<DeleteResult> {
    return await this.channelsRepository.delete(chan_id);
  }

  /**
   * Saves a new channel into db
   * nb: save(channel) is a function from the typeORM library
   */
  async saveChannel(channelDto: CreateChannelDto): Promise<ChannelMember> {
    const newChannel = this.channelsRepository.create(channelDto);
    const owner = await this.userService.getUserbyId(channelDto.owner_id);

    if (newChannel.password) {
      const salt = await bcrypt.genSalt();
      newChannel.password = await bcrypt.hash(channelDto.password, salt); //must be crypted
    }

    await this.channelsRepository.save(newChannel);
    return await this.channelMemberService.createChannelMember(
      newChannel,
      owner,
      true,
      true,
    );
  }

  async muteBanMember(
    action: string,
    cm_id: number,
    end_date: number,
  ): Promise<ChannelMember> {
    return await this.channelMemberService.muteBanMember(
      action,
      cm_id,
      end_date,
    );
  }

  async toggleAdmin(cm_id: number): Promise<ChannelMember> {
    return await this.channelMemberService.toggleAdmin(cm_id);
  }

  async updateChannelPassword(chan_id: number, pwd: string): Promise<Channel> {
    const channel = await this.getChannelById(chan_id);

    if (pwd != 'null') {
      const salt = await bcrypt.genSalt();
      channel.password = await bcrypt.hash(pwd, salt); //must be crypted
    } else {
      channel.password = '';
    }

    return await this.channelsRepository.save(channel);
  }
}
