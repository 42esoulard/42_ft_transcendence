import { Injectable } from '@nestjs/common';
import { ChannelMember } from './interfaces/channel_member.interface';
import { User } from '../users/interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelMembers } from './entity/channel_members.entity';
// import { CreateChannelDto } from './dto/createChannel.dto';
// import { UpdateChannelDto } from './dto/updateChannel.dto';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/users/entity/users.entity';
import { Channels } from 'src/channels/entity/channels.entity';
import { reduce } from 'rxjs';
// import { Users } from 'src/users/entity/users.entity';

@Injectable()
export class ChannelMembersService {
  constructor(
    @InjectRepository(ChannelMembers)
    private readonly channelMembersRepository: Repository<ChannelMembers>,
  ) {}

  // /**
  //  * Lists all channelmembers in database
  //  * nb: find() is a function from the typeORM library
  //  */
  // async getAllChannelMembers(): Promise<ChannelMembers[]> {
  //   return await this.channelMembersRepository.find({
  //     relations: ['channel', 'member'],
  //   });
  // }

  async getUserChannels(user: Users) {
    const res = await this.channelMembersRepository
      .createQueryBuilder('channel_members')
      .leftJoinAndSelect('channel_members.channel', 'channels')
      .where({ member: user })
      .getMany();

    // console.log('in getuserchannels', res);
    return res;
  }

  async createChannelMember(
    channel: Channels,
    user: Users,
    is_owner = false,
    is_admin = false,
  ): Promise<ChannelMembers> {
    //   return await this.channelMembersRepository.find({
    //     relations: ['channel', 'member'],
    //   });
    // }
    return this.channelMembersRepository.save({
      channel: channel,
      member: user,
      is_owner: is_owner,
      is_admin: is_admin,
    });
  }

  async deleteChannelMember(channel: Channels, user: Users) {
    //   return await this.channelMembersRepository.find({
    //     relations: ['channel', 'member'],
    //   });
    // }
    this.channelMembersRepository.delete({
      channel: channel,
      member: user,
    });
  }

  async toggleAdmin(channel: Channels, user: Users) {
    //   return await this.channelMembersRepository.find({
    //     relations: ['channel', 'member'],
    //   });
    // }
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

  // async getChannelsOfMember(user: Users): Promise<Channels[]> {
  //   return await this.channelMembersRepository.find({
  //     where: { member: user },
  //     relations: ['this.channel'],
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

  // /**
  //  * Gets a channel in database by its name
  //  * nb: findOne(id) is a function from the typeORM library
  //  */
  // async getChannelByName(name: string): Promise<Channel> {
  //   const channel = await this.channelMembersRepository.findOne({
  //     where: { name: name },
  //   });
  //   // console.log('getChannelByName', name, channel);
  //   return channel;
  // }

  // /**
  //  * Gets a channel in database by its id
  //  * nb: findOne(id) is a function from the typeORM library
  //  */
  // async getChannelById(id: number): Promise<ChannelMembers> {
  //   console.log('in get channel by id', id);
  //   return await this.channelMembersRepository.findOne(id, {
  //     relations: ['members'],
  //   });
  //   // const ret = await this.channelMembersRepository
  //   //   .findOne(id)
  //   //   .then((res) => {
  //   //     console.log(ret);
  //   //     if (ret == undefined && id === 0) {
  //   //       this.seed().then(() => {
  //   //         console.log('seeded');
  //   //         return this.getChannelById(0);
  //   //       });
  //   //       // return this.getChannelById(id);
  //   //     }
  //   //     console.log(
  //   //       'not seeded res:',
  //   //       res,
  //   //       typeof res,
  //   //       id,
  //   //       res == undefined,
  //   //       res === undefined,
  //   //     );
  //   //     return res;
  //   //   })
  //   //   .catch(() => {
  //   //     if (id === 0) {
  //   //       this.seed();
  //   //       console.log('seeded');
  //   //       return this.getChannelById(id);
  //   //     }
  //   //   });
  //   // return ret;
  //   // console.log('getChannelById', id, res);
  //   // return res;
  // }

  // async joinChannel(channel_id: number, user_id: number): Promise<Channel> {
  //   const channelEntry: ChannelMembers = await this.getChannelById(channel_id);
  //   const userEntry: Users = await this.userService.getUserbyId(user_id);

  //   // console.log('in joinchannel BEFORE', channelEntry.members);
  //   if (!channelEntry.members) {
  //     channelEntry.members = [];
  //   }
  //   channelEntry.members.push(userEntry);
  //   // console.log('in joinchannel', channelEntry.members);
  //   return await this.channelMembersRepository.save(channelEntry);
  // }

  // async leaveChannel(channel: Channel, user: User): Promise<Channel> {
  //   const channelEntry: ChannelMembers = await this.getChannelById(channel.id);
  //   const userEntry: Users = await this.userService.getUserbyId(user.id);

  //   if (
  //     channelEntry &&
  //     userEntry &&
  //     channelEntry.members &&
  //     channelEntry.members.includes(userEntry)
  //   )
  //     channelEntry.members.splice(channelEntry.members.indexOf(userEntry), 1);
  //   return await this.channelMembersRepository.save(channelEntry);
  // }

  // // async getJoinedChannelMembers(user_id: number): Promise<User> {
  // //   // await this.userService.getUserChannelMembers(user_id).then((res) => {
  // //   //   console.log("in service", res.channelmembers)
  // //   //   return res.channelmembers;
  // //   // });
  // //   return await this.userService.getUserChannelMembers(user_id);
  // // }

  // /**
  //  * Saves a new channel into db
  //  * nb: save(channel) is a function from the typeORM library
  //  */
  // async saveChannel(channelDto: CreateChannelDto): Promise<Channel> {
  //   console.log('IN SAVE CHANNEL', channelDto);
  //   const newChannel = this.channelMembersRepository.create(channelDto);
  //   // newChannel.owner_id = channelDto.owner_id;
  //   newChannel.owner = await this.userService.getUserbyId(channelDto.owner_id);

  //   if (newChannel.type === 'password-protected') {
  //     (newChannel.salt = await bcrypt.genSalt()),
  //       (newChannel.password = await bcrypt.hash(
  //         channelDto.password,
  //         newChannel.salt,
  //       )); //must be crypted
  //   }

  //   newChannel.members = [];
  //   if (newChannel.type === 'public') {
  //     await this.userService.getUsers().then((res) => {
  //       res.forEach((user) => {
  //         newChannel.members.push(user);
  //       });
  //     });
  //   } else {
  //     newChannel.members.push(newChannel.owner);
  //   }

  //   // await this.channelMembersRepository.save(newChannel).then(async (res) => {
  //   //   await this.joinChannel(res.id, res.owner.id);
  //   // });
  //   // console.log("in chan service newchan", newChannel)
  //   return await this.channelMembersRepository.save(newChannel);
  // }

  // /**
  //  * We probably don't need to make channelmembers editable
  //  * Updates a channel into db
  //  * nb: save(channel) is a function from the typeORM library
  //  */
  // // async updateChannel(updatedChannel: UpdateChannelDto): Promise<Channel> {
  // // 	return await this.channelMembersRepository.save(updatedChannel);
  // }
}
