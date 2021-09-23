import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UsersModule,
    ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
