import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entity/games.entity';
import { PongGateway } from './pong.gateway';
import { PongController } from './pong.controller';
import { PongService } from './pong.service';

@Module({
	imports: [TypeOrmModule.forFeature([Game])],
	providers: [PongGateway, PongService],
	controllers: [PongController]
})
export class PongModule {}
