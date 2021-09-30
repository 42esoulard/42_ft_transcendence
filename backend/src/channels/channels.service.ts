import { Injectable } from '@nestjs/common';
import { Channel } from './interfaces/channel.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channels } from './entity/channels.entity';
import { CreateChannelDto } from './dto/createChannel.dto';
// import { UpdateChannelDto } from './dto/updateChannel.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channels)
    private readonly ChannelsRepository: Repository<Channels>,
  ) {}

  /**
   * Lists all channels in database
   * nb: find() is a function from the typeORM library
   */
  async getChannels(): Promise<Channel[]> {
    return await this.ChannelsRepository.find();
  }

  /**
   * Gets a channel in database by its id
   * nb: findOne(id) is a function from the typeORM library
   */
  async getChannelbyId(id: number): Promise<Channel> {
    const res = await this.ChannelsRepository.findOne(id);
    console.log('res', res);
    return res;
  }

  /**
   * Saves a new channel into db after generating pw hash and salt
   * nb: save(channel) is a function from the typeORM library
   */
  async saveChannel(channelDto: CreateChannelDto): Promise<Channel> {
    // newChannel must be of type Channel or CreateChannelDto ??
    const newChannel: Channel = channelDto as Channel;

    return await this.ChannelsRepository.save(newChannel);
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
