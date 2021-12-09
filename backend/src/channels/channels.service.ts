import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { RelationshipsService } from 'src/relationships/relationships.service';
import { Role } from 'src/auth/models/role.enum';
import { ChannelMembers } from 'src/channel_members/entity/channel_members.entity';
import { Messages } from 'src/messages/entity/messages.entity';
import { User } from 'src/users/interfaces/user.interface';

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

  async getChannelsByName(name: string): Promise<Channel[]> {
    const channels = await this.channelsRepository.find({
      where: { name: name },
    });
    return channels;
  }

  async getUser(user_id: number): Promise<Users> {
    return await this.userService.getUserbyId(user_id);
  }

  async getNotifications(userId: number): Promise<boolean> {
    const user: Users = await this.userService.getUserbyId(userId);
    if (user == undefined) {
      return undefined;
    }
    let cms: ChannelMembers[] = await this.channelMemberService.getUserChannels(
      user,
    );
    if (cms == undefined) {
      return undefined;
    }
    cms = cms.filter((cms) => cms.new_message);
    if (cms.length) {
      return true;
    } else {
      return false;
    }
  }

  async getNewNotification(data: Messages, userId: number): Promise<boolean> {
    const cms: ChannelMember = await this.getChannelMember(
      data.channel.id,
      userId,
    );
    if (cms == undefined || cms.ban || !cms.notification) {
      return false;
    }

    return await this.relationshipService
      .getBlockedByUser(userId)
      .then(async (blocked) => {
        if (
          blocked.map((blocked) => blocked.adresseeId).includes(data.author.id)
        ) {
          return false;
        }
        return await this.channelMemberService
          .setNewMessage(true, cms.id)
          .then((res) => {
            if (res) {
              return res.new_message;
            }
            return false;
          })
          .catch((err) => {
            return false;
          });
      });
  }

  async getChannelMember(
    channel_id: number,
    user_id: number,
  ): Promise<ChannelMember> {
    const channel: Channels = await this.getChannelById(channel_id, user_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    return await this.channelMemberService.getChannelMember(channel, user);
  }

  async setNewMessage(status: boolean, cmId: number): Promise<ChannelMember> {
    return await this.channelMemberService.setNewMessage(status, cmId);
  }

  async toggleNotification(cm: ChannelMember): Promise<ChannelMember> {
    return await this.channelMemberService.toggleNotification(cm.id);
  }

  async notifyOfflineUsers(message: Messages, onlineUsers: User[]) {
    await this.channelsRepository
      .findOne(message.channel.id)
      .then((channel) => {
        if (channel == undefined) {
          return;
        }
        const chanMembers = channel.channel_members;
        const onlineMemberIds = onlineUsers.map((user) => user.id);
        const offlineMembers = chanMembers.filter(
          (cm) => !onlineMemberIds.includes(cm.member.id),
        );
        offlineMembers.forEach((cm) => {
          this.channelMemberService.setNewMessage(true, cm.id);
        });
      })
      .catch((err) => console.log('Caught error:', err));
  }

  async getCmById(cm_id: number): Promise<ChannelMember> {
    return await this.channelMemberService.getChannelMemberById(cm_id);
  }

  async checkBlocked(user_id: number, blocked_id: number): Promise<boolean> {
    return await this.relationshipService
      .getUserBlocked(user_id)
      .then((res) => {
        if (
          res &&
          (res.map((res) => res.adresseeId).includes(blocked_id) ||
            res.map((res) => res.requesterId).includes(blocked_id))
        ) {
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
              (msg) =>
                !res.map((res) => res.adresseeId).includes(msg.author.id),
            );
            cm.channel.messages.sort((a, b) => a.id - b.id);
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
              (msg) =>
                !res.map((res) => res.adresseeId).includes(msg.author.id),
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
        } else if (channel.messages) {
          channel.messages.sort((a, b) => a.id - b.id);
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
            if (channel.messages) {
              channel.messages.sort((a, b) => a.id - b.id);
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
          return undefined;
        } else if (user.role == Role.USER && channel.password) {
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
            if (channel.messages) {
              channel.messages.sort((a, b) => a.id - b.id);
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
    const cm = await this.channelMemberService.getChannelMemberById(cm_id);
    if (cm == undefined) {
      return;
    }
    return await this.channelMemberService
      .deleteChannelMember(cm_id)
      .then(async (res) => {
        if (
          cm.channel.channel_members.length == 1 &&
          cm.channel.type == 'private'
        ) {
          return await this.deleteChannel(cm.channel.id);
        }
      });
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

  async saveDmChannel(dmInfo: CreateChannelDto): Promise<ChannelMember> {
    if (dmInfo.owner_id == dmInfo.recipient_id) {
      throw new BadRequestException("You can't dm yourself!");
    }
    const split = dmInfo.name.split(' ');
    if (split.length !== 3) {
      throw new BadRequestException('Bad dm name format!');
    }

    return await this.getChannelsByName(dmInfo.name).then(async (res) => {
      if (res) {
        res.forEach((chan) => {
          if (
            chan.channel_members.length == 2 &&
            ((chan.channel_members[0].member.id == dmInfo.owner_id &&
              chan.channel_members[1].member.id == dmInfo.recipient_id) ||
              (chan.channel_members[1].member.id == dmInfo.owner_id &&
                chan.channel_members[0].member.id == dmInfo.recipient_id))
          ) {
            throw new BadRequestException('DM channel already exists!');
          }
        });
      }
      const altName: string = split[2] + ' ' + split[1] + ' ' + split[0];
      return await this.getChannelsByName(altName).then(async (res) => {
        if (res) {
          res.forEach((chan) => {
            if (
              chan.channel_members.length == 2 &&
              ((chan.channel_members[0].member.id == dmInfo.owner_id &&
                chan.channel_members[1].member.id == dmInfo.recipient_id) ||
                (chan.channel_members[1].member.id == dmInfo.owner_id &&
                  chan.channel_members[0].member.id == dmInfo.recipient_id))
            ) {
              throw new BadRequestException('DM channel already exists!');
            }
          });
        }

        return await this.checkBlocked(
          dmInfo.owner_id,
          dmInfo.recipient_id,
        ).then(async (res) => {
          if (res == true) {
            throw new ForbiddenException('Failed to create DM: active block');
          }
          const recipient = await this.userService.getUserbyId(
            dmInfo.recipient_id,
          );
          const owner = await this.userService.getUserbyId(dmInfo.owner_id);
          if (recipient == undefined || owner == undefined) {
            throw new ForbiddenException(
              'Failed to create DM: unknown recipient or sender',
            );
          }
          return await this.channelsRepository
            .save(dmInfo)
            .then(async (res) => {
              await this.channelMemberService.createChannelMember(
                res,
                recipient,
                true,
                true,
                dmInfo.notification,
              );
              return await this.channelMemberService.createChannelMember(
                res,
                owner,
                true,
                true,
                dmInfo.notification,
              );
            })
            .catch(() => {
              throw new BadRequestException(
                'Channel did not comply database requirements',
              );
            });
        });
      });
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

    return await this.getChannelByName(channelDto.name).then(async (res) => {
      if (res) {
        throw new BadRequestException('Channel name already exists!');
      }
      return await this.channelsRepository
        .save(newChannel)
        .then(async (res) => {
          return await this.channelMemberService.createChannelMember(
            res,
            owner,
            true,
            true,
            channelDto.notification,
          );
        })
        .catch(() => {
          throw new BadRequestException(
            'Channel did not comply database requirements',
          );
        });
    });
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
