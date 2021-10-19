import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channels } from './entity/channels.entity';
import { UsersModule } from 'src/users/users.module';
export { ChannelsService } from './channels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Channels]), UsersModule],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [ChannelsService],
})
export class ChannelsModule {}
