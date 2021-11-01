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
import { AsyncSubject } from 'rxjs';

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

  async getUserChannels(user_id: number): Promise<ChannelMember[]> {
    const user: Users = await this.userService.getUserbyId(user_id);
    return await this.channelMemberService.getUserChannels(user);
  }

  async getAvailableChannels(user_id: number): Promise<Channel[]> {
    let channels = await this.getChannels();
    await this.getUserChannels(user_id)
      .then(async (res) => {
        const userChannels = res.map((cm) => cm.channel);
        channels = channels.filter(
          (channels) =>
            !userChannels
              .map((userChannels) => userChannels.id)
              .includes(channels.id),
        );

        return await channels;
      })
      .catch((err) => console.log(err));
    return await channels;
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

  // async joinAllChannels(user_id: number): Promise<ChannelMember> {
  //   const user: Users = await this.userService.getUserbyId(user_id);
  //   const allChannels = await this.getChannels();
  //   let ret;

  //   allChannels.forEach(async (chan) => {
  //     await this.channelMemberService
  //       .getChannelMember(chan, user)
  //       .then(async (res) => {
  //         console.log(res);
  //         if (!res) {
  //           if (chan.id === 1) {
  //             ret = await this.channelMemberService.createChannelMember(chan, user);
  //           } else {
  //             await this.channelMemberService.createChannelMember(chan, user);
  //           }
  //         }
  //       });
  //   });
  //   return await ret;
  // }

  async leaveChannel(channel_id: number, user_id: number) {
    const channel: Channels = await this.getChannelById(channel_id);
    const user: Users = await this.userService.getUserbyId(user_id);

    await this.channelMemberService.deleteChannelMember(channel, user);
  }

  /**
   * Saves a new channel into db
   * nb: save(channel) is a function from the typeORM library
   */
  async saveChannel(channelDto: CreateChannelDto): Promise<ChannelMember> {
    console.log('IN SAVE CHANNEL', channelDto);
    const newChannel = this.channelsRepository.create(channelDto);
    let newChannelOwner;
    newChannel.owner = await this.userService.getUserbyId(channelDto.owner_id);

    if (newChannel.type === 'password-protected') {
      (newChannel.salt = await bcrypt.genSalt()),
        (newChannel.password = await bcrypt.hash(
          channelDto.password,
          newChannel.salt,
        )); //must be crypted
    }

    await this.channelsRepository.save(newChannel);

    if (newChannel.type === 'public') {
      await this.userService
        .getUsers()
        .then((res) => {
          res.forEach(async (user) => {
            if (user.id === newChannel.owner.id) {
              newChannelOwner = this.channelMemberService.createChannelMember(
                newChannel,
                user,
                true,
                true,
              );
            } else {
              this.channelMemberService.createChannelMember(newChannel, user);
            }
          });
        })
        .catch((err) => console.log(err));
    } else {
      newChannelOwner = this.channelMemberService.createChannelMember(
        newChannel,
        newChannel.owner,
        true,
        true,
      );
    }
    return await newChannelOwner;
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
