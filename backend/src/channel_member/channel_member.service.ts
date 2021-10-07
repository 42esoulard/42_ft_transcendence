import { Injectable } from '@nestjs/common';
import { ChannelMember } from './interfaces/channel_member.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelMembers } from './entity/channel_member.entity';
import { CreateChannelMemberDto } from './dto/createChannelMember.dto';
// import { UpdateChannelDto } from './dto/updateChannel.dto';
import * as bcrypt from 'bcrypt';
import { create } from 'domain';

@Injectable()
export class ChannelMembersService {
  constructor(
    @InjectRepository(ChannelMembers)
    private readonly channelMembersRepository: Repository<ChannelMembers>,
  ) {}

  /**
   * Lists all channelmembers in database
   * nb: find() is a function from the typeORM library
   */
  async getChannelMembers(): Promise<ChannelMember[]> {
    return await this.channelMembersRepository.find();
  }

  /**
   * Gets all of a member's joined channels
   * nb: find(id) is a function from the typeORM library
   */
  async getChannelsByMember(id: number): Promise<ChannelMember[]> {
    const channelMembers = await this.channelMembersRepository.find({
      where: { user_id: id },
    });
    return channelMembers;
  }

  /**
   * Gets all of a channel's members
   * nb: find(id) is a function from the typeORM library
   */
  async getMembersByChannel(id: number): Promise<ChannelMember[]> {
    const channelMembers = await this.channelMembersRepository.find({
      where: { channel_id: id },
    });
    return channelMembers;
  }

  /**
   * Gets a channel-member relationship
   * nb: find(id) is a function from the typeORM library
   */
  async getChannelMember(
    channel_id: number,
    user_id: number,
  ): Promise<ChannelMember> {
    const channelMember = await this.channelMembersRepository.findOne({
      where: { channel_id: channel_id, user_id: user_id },
    });
    return channelMember;
  }

  /**
   * Saves a new channel-member into db
   * nb: save() is a function from the typeORM library
   */
  async saveChannelMember(
    channelMemberDto: CreateChannelMemberDto,
  ): Promise<ChannelMember> {
    const newChannel: ChannelMember = {
      channel_id: channelMemberDto.channelId,
      user_id: channelMemberDto.userId,
      is_admin: channelMemberDto.isAdmin,
    };
    console.log('in save channel member', newChannel);
    return await this.channelMembersRepository.save(newChannel);
  }

  /**
   * We probably don't need to make channelmembers editable
   * Updates a channel into db
   * nb: save(channel) is a function from the typeORM library
   */
  // async updateChannel(updatedChannel: UpdateChannelDto): Promise<Channel> {
  // 	return await this.ChannelMembersRepository.save(updatedChannel);
  // }
}
