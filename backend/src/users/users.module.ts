import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
export { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './entity/users.entity';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
