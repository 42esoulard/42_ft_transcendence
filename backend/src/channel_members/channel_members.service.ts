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
      relations: ['channel'],
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

  async deleteChannelMember(channel: Channels, user: Users) {
    this.channelMembersRepository.delete({
      channel: channel,
      member: user,
    });
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
      });
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
