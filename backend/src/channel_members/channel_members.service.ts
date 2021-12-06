import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ChannelMembers } from './entity/channel_members.entity';
import { Users } from 'src/users/entity/users.entity';
import { Channels } from 'src/channels/entity/channels.entity';
import { ChannelMember } from './interfaces/channel_member.interface';

@Injectable()
export class ChannelMembersService {
  constructor(
    @InjectRepository(ChannelMembers)
    private readonly channelMembersRepository: Repository<ChannelMembers>,
  ) {}

  async getUserChannels(user: Users): Promise<ChannelMembers[]> {
    return await this.channelMembersRepository
      .find({
        where: { member: user },
        relations: ['channel', 'member'],
      })
      .then((res) => {
        if (res == undefined) {
          return undefined;
        }
        return res.sort((a, b) => a.channel.id - b.channel.id);
      });
  }

  async getChannelMember(
    channel: Channels,
    user: Users,
  ): Promise<ChannelMembers> {
    return await this.channelMembersRepository.findOne({
      where: {
        channel: channel,
        member: user,
      },
      relations: ['channel', 'member'],
    });
  }

  async getChannelMemberById(cm_id: number): Promise<ChannelMembers> {
    return await this.channelMembersRepository.findOne({
      where: {
        id: cm_id,
      },
      relations: ['channel', 'member'],
    });
  }

  async createChannelMember(
    channel: Channels,
    user: Users,
    is_owner = false,
    is_admin = false,
    notification = false,
  ): Promise<ChannelMembers> {
    return await this.channelMembersRepository
      .save({
        channel: channel,
        member: user,
        is_owner: is_owner,
        is_admin: is_admin,
        notification: notification,
      })
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
  }

  async deleteChannelMember(cm_id: number): Promise<DeleteResult> {
    return this.channelMembersRepository
      .delete(cm_id)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
  }

  async toggleAdmin(cm_id: number): Promise<ChannelMembers> {
    return await this.getChannelMemberById(cm_id).then((res) => {
      if (res) {
        res.is_admin = !res.is_admin;
        res.mute = '';
        res.ban = '';
        return this.channelMembersRepository
          .save(res)
          .then((result) => {
            return result;
          })
          .catch(() => {
            throw new BadRequestException(
              'Channel Member did not comply database requirements',
            );
          });
      }
    });
  }

  async muteBanMember(
    action: string,
    cm_id: number,
    end_date: number,
  ): Promise<ChannelMembers> {
    return await this.getChannelMemberById(cm_id).then(async (res) => {
      switch (action) {
        case 'unmute':
          res.mute = null;
          break;
        case 'unban':
          res.ban = null;
          break;
        case 'muted':
          res.mute = end_date.toString();
          break;
        case 'banned':
          res.ban = end_date.toString();
          break;
      }
      return await this.channelMembersRepository
        .save(res)
        .then((result) => {
          return result;
        })
        .catch(() => {
          throw new BadRequestException(
            'Channel Member did not comply database requirements',
          );
        });
    });
  }

  checkMute(cm: ChannelMembers): boolean {
    if (cm.mute && Number(cm.mute) - Date.now() <= 0) {
      cm.mute = null;
      this.channelMembersRepository.save(cm).catch(() => {
        throw new BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
    }
    if (!cm.mute) {
      return false;
    }
    return true;
  }

  checkBan(cm: ChannelMembers): boolean {
    if (cm.ban && Number(cm.ban) - Date.now() <= 0) {
      cm.ban = null;
      this.channelMembersRepository.save(cm).catch(() => {
        throw new BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
    }
    if (!cm.ban) {
      return false;
    }
    return true;
  }

  async setNewMessage(status: boolean, cmId: number): Promise<ChannelMember> {
    const cm: ChannelMembers = await this.getChannelMemberById(cmId);
    if (!cm.notification) {
      if (cm.new_message == false) {
        return cm;
      }
      status = false;
    }
    cm.new_message = status;
    return await this.channelMembersRepository
      .save(cm)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel member did not comply database requirements',
        );
      });
  }

  async toggleNotification(cmId: number): Promise<ChannelMember> {
    const cm: ChannelMembers = await this.getChannelMemberById(cmId);
    if (cm == undefined) {
      throw new BadRequestException(
        'Channel Member did not comply database requirements',
      );
    }
    cm.notification = !cm.notification;
    cm.new_message = false;

    return await this.channelMembersRepository
      .save(cm)
      .then((res) => {
        return res;
      })
      .catch(() => {
        throw new BadRequestException(
          'Channel Member did not comply database requirements',
        );
      });
  }
}
