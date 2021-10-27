import { Module } from '@nestjs/common';
import { FriendshipsService } from './friendships.service';
export { FriendshipsService } from './friendships.service';
import { FriendshipsController } from './friendships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Friendships } from './entity/friendships.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Friendships]), UsersModule],
  providers: [FriendshipsService],
  controllers: [FriendshipsController],
  exports: [FriendshipsService],
})
export class FriendshipsModule {}
