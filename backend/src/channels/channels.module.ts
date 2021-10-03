import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channels } from './entity/channels.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Channels])],
  providers: [ChannelsService],
  controllers: [ChannelsController],
})
export class ChannelsModule {}
