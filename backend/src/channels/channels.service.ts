import { BadRequestException, Injectable } from '@nestjs/common';
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
import { RelationshipsService } from 'src/relationships/relationships.service';
import { Role } from 'src/auth/models/role.enum';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly channelsRepository: Repository<Channels>,
    private readonly userService: UsersService,
    private readonly channelMemberService: ChannelMembersService,
    private readonly relationshipService: RelationshipsService,
  ) {}

  async seed(): Promise<Channel> {
    console.log('Initializing default channel...');
    return await this.channelsRepository
      .save({
        id: 1,
        name: 'General',
        password: null,
        type: 'public',
      })
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel did not comply database requirements',
        );
      });
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

  async getUser(user_id: number): Promise<Users> {
    return await this.userService.getUserbyId(user_id);
  }

  async getChannelMember(
    channel_id: number,
    user_id: number,
  ): Promise<ChannelMember> {
    const channel: Channels = await this.getChannelById(channel_id, user_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    return await this.channelMemberService.getChannelMember(channel, user);
  }

  async getCmById(
    cm_id: number,
  ): Promise<ChannelMember> {
    return await this.channelMemberService.getChannelMemberById(cm_id);
  }

  async checkBlocked(user_id: number, blocked_id: number): Promise<boolean> {
    return await this.relationshipService
      .getUserBlocked(user_id)
      .then((res) => {
        if (res && (res.map((res) => res.adresseeId).includes(blocked_id) ||
        res.map((res) => res.requesterId).includes(blocked_id))) {
          return true;
        }
        return false;
      });
  }

  async filterBanned(userChannels: ChannelMember[]): Promise<ChannelMember[]> {
    return userChannels.filter((userChannels) => !userChannels.ban);
  }

  async filterBlocked(
    user: Users,
    userChannels: ChannelMember[],
  ): Promise<ChannelMember[]> {
    return await this.relationshipService
      .getBlockedByUser(user.id)
      .then((res) => {
        userChannels.forEach((cm) => {
          if (res && cm.channel.messages) {
            cm.channel.messages = cm.channel.messages.filter(
              (msg) => !res.map((res) => res.adresseeId).includes(msg.author.id),
            );
          }
          if (res && cm.channel.channel_members) {
            cm.channel.channel_members = cm.channel.channel_members.filter(
              (member) =>
                !res.map((res) => res.adresseeId).includes(member.member.id),
            );
          }
        });
        return userChannels;
      });
  }

  async filterBlockedInAvail(
    userId: number,
    channels: Channel[],
  ): Promise<Channel[]> {
    return await this.relationshipService
      .getBlockedByUser(userId)
      .then((res) => {
        channels.forEach((chan) => {
          if (chan.messages && res) {
            chan.messages = chan.messages.filter(
              (msg) => !res.map((res) => res.adresseeId).includes(msg.author.id),
            );
          }
          if (chan.channel_members && res) {
            chan.channel_members = chan.channel_members.filter(
              (member) =>
                !res.map((res) => res.adresseeId).includes(member.member.id),
            );
          }
        });
        return channels;
      });
  }

  async getUserChannels(user_id: number): Promise<ChannelMember[]> {
    const user: Users = await this.userService.getUserbyId(user_id);
    return await this.channelMemberService
      .getUserChannels(user)
      .then(async (res) => {
        return await this.filterBlocked(user, res);
      });
  }

  async getAvailableChannels(user_id: number): Promise<Channel[]> {
    const user = await this.getUser(user_id);
    if (user == undefined) {
      return undefined;
    }
    let channels = await this.getChannels();
    return await this.getUserChannels(user_id).then(async (res) => {
      const userChannels = res.map((cm) => cm.channel);
      channels = channels.filter(
        (channels) =>
          !userChannels
            .map((userChannels) => userChannels.id)
            .includes(channels.id),
      );
      if (user.role == Role.OWNER || user.role == Role.ADMIN) {
        return await this.filterBlockedInAvail(user_id, channels);
      }
      channels = channels.filter((channels) => channels.type === 'public');
      channels.forEach((channel) => {
        if (channel.password) {
          channel.messages = [];
        }
      });
      return await this.filterBlockedInAvail(user_id, channels);
    });
  }

  /**
   * Gets a channel in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getChannelById(chanId: number, userId: number): Promise<Channels> {
    return await this.channelsRepository
      .findOne(chanId, {
        relations: ['messages', 'channel_members'],
      })
      .then(async (channel) => {
        if (channel == undefined) {
          return undefined;
        }
        return await this.relationshipService
          .getBlockedByUser(userId)
          .then((blocked) => {
            if (channel.messages && blocked) {
              channel.messages = channel.messages.filter(
                (msg) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(msg.author.id),
              );
            }
            if (channel.channel_members && blocked) {
              channel.channel_members = channel.channel_members.filter(
                (member) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(member.member.id),
              );
            }
            return channel;
          });
      });
  }

  async getChannelPreview(chanId: number, userId: number): Promise<Channel> {
    const user = await this.getUser(userId);
    if (user == undefined) {
      return undefined;
    }
    return await this.channelsRepository
      .findOne(chanId, {
        relations: ['messages'],
      })
      .then(async (channel) => {
        if (channel == undefined) {
          return undefined;
        }
        if (user.role == Role.USER && channel.type == 'private') {
          channel.messages = [];
          return channel;
        }
        return await this.relationshipService
          .getBlockedByUser(userId)
          .then((blocked) => {
            if (channel.messages && blocked) {
              channel.messages = channel.messages.filter(
                (msg) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(msg.author.id),
              );
            }
            if (channel.channel_members && blocked) {
              channel.channel_members = channel.channel_members.filter(
                (member) =>
                  !blocked
                    .map((blocked) => blocked.adresseeId)
                    .includes(member.member.id),
              );
            }
            return channel;
          });
      });
  }

  async checkPasswordMatch(
    channel_id: number,
    user_id: number,
    attempt: string,
  ): Promise<boolean> {
    const channel: Channels = await this.getChannelById(channel_id, user_id);
    const ret = await bcrypt.compare(attempt, channel.password);
    return await ret;
  }

  async joinChannel(
    channel_id: number,
    user_id: number,
  ): Promise<ChannelMember> {
    const channel: Channels = await this.getChannelById(channel_id, user_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    const cm = await this.channelMemberService.getChannelMember(channel, user);
    if (cm) {
      return await cm;
    }
    return await this.channelMemberService.createChannelMember(channel, user);
  }

  async leaveChannel(cm_id: number): Promise<DeleteResult> {
    return await this.channelMemberService.deleteChannelMember(cm_id);
  }

  async deleteChannel(chan_id: number): Promise<DeleteResult> {
    return await this.channelsRepository
      .delete(chan_id)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel did not comply database requirements',
        );
      });
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

    await this.channelsRepository
      .save(newChannel)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel did not comply database requirements',
        );
      });
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

  async updateChannelPassword(
    chan_id: number,
    user_id: number,
    pwd: string,
  ): Promise<Channel> {
    const channel = await this.getChannelById(chan_id, user_id);

    if (pwd != 'null') {
      const salt = await bcrypt.genSalt();
      channel.password = await bcrypt.hash(pwd, salt); //must be crypted
    } else {
      channel.password = '';
    }

    return await this.channelsRepository
      .save(channel)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel did not comply database requirements',
        );
      });
  }
}
