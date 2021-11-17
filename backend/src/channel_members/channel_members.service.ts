import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { ChannelMembers } from './entity/channel_members.entity';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/users/entity/users.entity';
import { Channels } from 'src/channels/entity/channels.entity';

@Injectable()
export class ChannelMembersService {
  constructor(
    @InjectRepository(ChannelMembers)
    private readonly channelMembersRepository: Repository<ChannelMembers>,
  ) {}

  async getUserChannels(user: Users): Promise<ChannelMembers[]> {
    return await this.channelMembersRepository.find({
      where: { member: user },
      relations: ['channel', 'member'],
      order: { id: 'ASC' },
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
  ): Promise<ChannelMembers> {
    return await this.channelMembersRepository.save({
      channel: channel,
      member: user,
      is_owner: is_owner,
      is_admin: is_admin,
    });
  }

  async deleteChannelMember(cm_id: number): Promise<DeleteResult> {
    return this.channelMembersRepository.delete(cm_id);
  }

  async toggleAdmin(cm_id: number): Promise<ChannelMembers> {
    return await this.getChannelMemberById(cm_id).then((res) => {
      if (res) {
        res.is_admin = !res.is_admin;
        res.mute = '';
        res.ban = '';
        return this.channelMembersRepository.save(res);
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
      return await this.channelMembersRepository.save(res);
    });
  }

  checkMute(cm: ChannelMembers): boolean {
    if (cm.mute && Number(cm.mute) - Date.now() <= 0) {
      cm.mute = null;
      this.channelMembersRepository.save(cm);
    }
    if (!cm.mute) {
      return false;
    }
    return true;
  }
  // /**
  //  * Lists all channelmembers in database
  //  * nb: find() is a function from the typeORM library
  //  */
  // async getAllChannelMembers(): Promise<ChannelMembers[]> {
  //   return await this.channelMembersRepository.find({
  //     relations: ['channel', 'member'],
  //   });
  // }

  // async getMembersOfChannel(): Promise<ChannelMembers[]> {
  //   return await this.channelMembersRepository.find({
  //     relations: ['channel', 'member'],
  //   });
  // }

  // async getChannelAdmins(): Promise<ChannelMembers[]> {
  //   return await this.channelMembersRepository.find({
  //     relations: ['channel', 'member'],
  //   });
  // }

  // async getChannelOwner(): Promise<ChannelMembers[]> {
  //   return await this.channelMembersRepository.find({
  //     relations: ['channel', 'member'],
  //   });
  // }
}
