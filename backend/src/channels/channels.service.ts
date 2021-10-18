import { Injectable } from '@nestjs/common';
import { Channel } from './interfaces/channel.interface';
import { User } from '../users/interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entity/channels.entity';
import { CreateChannelDto } from './dto/createChannel.dto';
// import { UpdateChannelDto } from './dto/updateChannel.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly channelsRepository: Repository<Channels>,
  ) {}

  private readonly userService: UsersService;

  async seed() {
    console.log('Initializing default channel...');
    await this.channelsRepository
      .save({
        id: 0,
        name: 'General',
        owner: null,
        password: null,
        type: 'Public',
      })
      .then(() => console.log('Channels seed complete!'))
      .catch(() => console.log('Channels seed failed :('));
  }

  /**
   * Lists all channels in database
   * nb: find() is a function from the typeORM library
   */
  async getChannels(): Promise<Channel[]> {
    return await this.channelsRepository.find({
      relations: ['owner', 'messages', 'members'],
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

  /**
   * Gets a channel in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getChannelById(id: number): Promise<Channel> {
    const res = await this.channelsRepository.findOne(id).catch(() => {
      if (id === 0) {
        this.seed();
        return this.getChannelById(id);
      }
    });
    // console.log('getChannelById', id, res);
    return res;
  }

  async joinChannel(channel_id: number, user_id: number) {
    console.log('entering joinchan serv', channel_id, user_id);
    const channel = await this.getChannelById(channel_id);
    console.log(channel);
    const user = await this.userService.getUserbyId(user_id);
    console.log(user);
    console.log('in join chan serv');
    channel.members.push(user);
    console.log(channel);
  }

  async leaveChannel(channel: Channel, user: User) {
    if (channel.members.includes(user))
      channel.members.splice(channel.members.indexOf(user), 1);
  }

  /**
   * Saves a new channel into db
   * nb: save(channel) is a function from the typeORM library
   */
  async saveChannel(channelDto: CreateChannelDto): Promise<Channel> {
    console.log('IN SAVE CHANNEL', channelDto);
    const newChannel = this.channelsRepository.create(channelDto);
    // newChannel.owner_id = channelDto.owner_id;

    if (newChannel.type === 'password-protected') {
      (newChannel.salt = await bcrypt.genSalt()),
        (newChannel.password = await bcrypt.hash(
          channelDto.password,
          newChannel.salt,
        )); //must be crypted
    }

    const createdChannel = await this.channelsRepository.save(newChannel);

    return createdChannel;
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
