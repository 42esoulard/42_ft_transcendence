import { Injectable } from '@nestjs/common';
import { Channel } from './interfaces/channel.interface';
import { User } from '../users/interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entity/channels.entity';
import { CreateChannelDto } from './dto/createChannel.dto';
// import { UpdateChannelDto } from './dto/updateChannel.dto';
import { UsersService } from '../users/users.module';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/users/entity/users.entity';
import { ChannelMembersService } from 'src/channel_members/channel_members.service';
import { ChannelMember } from 'src/channel_members/interfaces/channel_member.interface';

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
      owner: null,
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
  async getChannels(): Promise<Channel[]> {
    return await this.channelsRepository.find({
      relations: ['messages', 'channel_members'],
    });
  }

  /**
   * Gets a channel in database by its name
   * nb: findOne(id) is a function from the typeORM library
   */
  async getChannelByName(name: string): Promise<Channel> {
    const channel = await this.channelsRepository.findOne({
      where: { name: name },
    });
    // console.log('getChannelByName', name, channel);
    return channel;
  }

  async getUserChannels(user_id: number){
    
    // const res = await this.usersRepository
    //   .findOne(id, {
    //     relations: ['channel_members', 'channel_members.member'],
    //   })
    // const res = await this.usersRepository
    //   .createQueryBuilder('user')
    //   .leftJoinAndSelect('user.channel_members', 'channel_members')
    //   .leftJoinAndSelect('channel_members.channel', 'channel')
    //   .select('channel')
    //   .getOne();
    // // .then((res) => console.log('in getuserchannels res', res));
    // console.log('in getuserchannels res', res);
    // return res;
    const user: Users = await this.userService.getUserbyId(user_id);
    return await this.channelMemberService.getUserChannels(user);
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
    // const ret = await this.channelsRepository
    //   .findOne(id)
    //   .then((res) => {
    //     console.log(ret);
    //     if (ret == undefined && id === 0) {
    //       this.seed().then(() => {
    //         console.log('seeded');
    //         return this.getChannelById(0);
    //       });
    //       // return this.getChannelById(id);
    //     }
    //     console.log(
    //       'not seeded res:',
    //       res,
    //       typeof res,
    //       id,
    //       res == undefined,
    //       res === undefined,
    //     );
    //     return res;
    //   })
    //   .catch(() => {
    //     if (id === 0) {
    //       this.seed();
    //       console.log('seeded');
    //       return this.getChannelById(id);
    //     }
    //   });
    // return ret;
    // console.log('getChannelById', id, res);
    // return res;
  }

  async joinChannel(
    channel_id: number,
    user_id: number,
  ): Promise<ChannelMember> {
    const channel: Channels = await this.getChannelById(channel_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    // console.log('in joinchannel BEFORE', channelEntry.members);
    // if (!channelEntry.members) {
    //   channelEntry.members = [];
    // }
    // channelEntry.members.push(userEntry);
    // console.log('in joinchannel', channelEntry.members);
    return await this.channelMemberService.createChannelMember(channel, user);
  }

  async leaveChannel(channel_id: number, user_id: number) {
    const channel: Channels = await this.getChannelById(channel_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    await this.channelMemberService.deleteChannelMember(channel, user);
  }

  // async getJoinedChannels(user_id: number): Promise<User> {
  //   // await this.userService.getUserChannels(user_id).then((res) => {
  //   //   console.log("in service", res.channels)
  //   //   return res.channels;
  //   // });
  //   return await this.userService.getUserChannels(user_id);
  // }

  /**
   * Saves a new channel into db
   * nb: save(channel) is a function from the typeORM library
   */
  async saveChannel(channelDto: CreateChannelDto): Promise<Channel> {
    console.log('IN SAVE CHANNEL', channelDto);
    const newChannel = this.channelsRepository.create(channelDto);
    // newChannel.owner_id = channelDto.owner_id;
    newChannel.owner = await this.userService.getUserbyId(channelDto.owner_id);

    if (newChannel.type === 'password-protected') {
      (newChannel.salt = await bcrypt.genSalt()),
        (newChannel.password = await bcrypt.hash(
          channelDto.password,
          newChannel.salt,
        )); //must be crypted
    }

    if (newChannel.type === 'public') {
      await this.userService.getUsers().then((res) => {
        res.forEach((user) => {
          if (user.id === newChannel.owner.id) {
            this.channelMemberService.createChannelMember(
              newChannel,
              user,
              true,
              true,
            );
          } else {
            this.channelMemberService.createChannelMember(newChannel, user);
          }
        });
      });
    } else {
      this.channelMemberService.createChannelMember(
        newChannel,
        newChannel.owner,
        true,
        true,
      );
    }

    // await this.channelsRepository.save(newChannel).then(async (res) => {
    //   await this.joinChannel(res.id, res.owner.id);
    // });
    // console.log("in chan service newchan", newChannel)
    return await this.channelsRepository.save(newChannel);
  }

  /**
   * We probably don't need to make channels editable
   * Updates a channel into db
   * nb: save(channel) is a function from the typeORM library
   */
  // async updateChannel(updatedChannel: UpdateChannelDto): Promise<Channel> {
  // 	return await this.ChannelsRepository.save(updatedChannel);
  // }
}
