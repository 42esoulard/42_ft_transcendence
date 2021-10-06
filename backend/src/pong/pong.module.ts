import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entity/games.entity';
import { PongGateway } from './pong.gateway';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';
import { GameStats } from './entity/gameStats.entity';
import { Users } from 'src/users/entity/users.entity';
import { GameUser } from './entity/gameUser.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Game, GameStats, Users, GameUser])],
	providers: [PongGateway, PongService],
	controllers: [PongController]
})
export class PongModule {}
