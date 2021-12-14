import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entity/games.entity';
import { PongGateway } from './pong.gateway';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { Users } from 'src/users/entity/users.entity';
import { GameUser } from './entity/gameUser.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Users, GameUser]), UsersModule],
  providers: [PongGateway, PongService],
  controllers: [PongController],
  exports: [PongService],
})
export class PongModule {}
