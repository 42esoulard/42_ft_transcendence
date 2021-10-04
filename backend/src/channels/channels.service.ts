import { Injectable } from '@nestjs/common';
import { Channel } from './interfaces/channel.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entity/channels.entity';
import { CreateChannelDto } from './dto/createChannel.dto';
// import { UpdateChannelDto } from './dto/updateChannel.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly channelsRepository: Repository<Channels>,
  ) {}

  private index: 1;

  /**
   * Lists all channels in database
   * nb: find() is a function from the typeORM library
   */
  async getChannels(): Promise<Channel[]> {
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
    console.log('getChannelByName', channel);
    return channel;
  }

  /**
   * Gets a channel in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getChannelById(id: number): Promise<Channel> {
    const res = await this.channelsRepository.findOne(id);
    console.log('res', res);
    return res;
  }

  /**
   * Saves a new channel into db
   * nb: save(channel) is a function from the typeORM library
   */
  async saveChannel(channelDto: CreateChannelDto): Promise<Channel> {
    const newChannel: Channel = {
      id: this.index,
      name: channelDto.name,
      owner_id: channelDto.ownerId,
      type: channelDto.type,
      salt: null,
      password: null,
      created_at: Math.floor(Date.now() / 1000),
    };
    if (newChannel.type === 'password-protected') {
      (newChannel.salt = await bcrypt.genSalt()),
        (newChannel.password = await bcrypt.hash(
          channelDto.password,
          newChannel.salt,
        )); //must be crypted
    }
    this.index++;

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
