import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Game } from './entity/games.entity';
import { PongGateway } from './pong.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([Game])],
	providers: [PongGateway]
})
export class PongModule {}
