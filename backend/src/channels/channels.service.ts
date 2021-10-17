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

  async seed() {
    this.saveChannel({
      name: 'General',
      owner_id: null,
      password: null,
      type: 'Public',
    });
  }

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
    console.log('getChannelByName', name, channel);
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
