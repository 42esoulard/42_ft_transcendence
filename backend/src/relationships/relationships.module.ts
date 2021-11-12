import { Module } from '@nestjs/common';
import { RelationshipsService } from './relationships.service';
export { RelationshipsService } from './relationships.service';
import { RelationshipsController } from './relationships.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Relationships } from './entity/relationships.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Relationships]), UsersModule],
  providers: [RelationshipsService],
  controllers: [RelationshipsController],
  exports: [RelationshipsService],
})
export class RelationshipsModule {}
