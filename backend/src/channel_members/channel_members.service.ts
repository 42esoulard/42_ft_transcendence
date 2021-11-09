import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const res = await this.channelMembersRepository.find({
      where: { member: user },
      relations: ['channel', 'member'],
      order: { id: 'ASC' },
    });
    // const res = await this.channelMembersRepository
    // .createQueryBuilder('channel_members')
    // .leftJoinAndSelect('channel_members.channel', 'channels')
    // .where({ member: user })
    // .getMany();
    return res;
  }

  async getChannelMember(channel: Channels, user: Users) {
    return await this.channelMembersRepository.findOne({
      where: {
        channel: channel,
        member: user,
      },
      relations: ['channel', 'member'],
    });
  }

  async getChannelMembers(channel: Channels) {
    return await this.channelMembersRepository.findOne({
      where: {
        channel: channel,
      },
      relations: ['channel', 'member'],
    });
  }

  async getChannelMemberById(cm_id: number) {
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

  async deleteChannelMember(cm_id: number) {
    this.channelMembersRepository.delete(cm_id);
  }

  async toggleAdmin(channel: Channels, user: Users) {
    this.channelMembersRepository
      .findOne({
        where: { channel: channel, member: user },
      })
      .then((res) => {
        if (res) {
          res.is_admin = !res.is_admin;
          return this.channelMembersRepository.save(res);
        }
      })
      .catch((err) => console.log(err));
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
